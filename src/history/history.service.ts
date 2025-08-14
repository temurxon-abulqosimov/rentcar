import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { History, RentalStatus, PaymentStatus } from './entities/history.entity';
import { Car, CarStatus } from '../cars/entities/car.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CarsService } from '../cars/cars.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly carsService: CarsService,
    private readonly usersService: UsersService,
  ) {}

  async createRental(createHistoryDto: any, userId: string): Promise<History> {
    const { carId, startDate, endDate, pickupLocation, dropoffLocation } = createHistoryDto;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start <= now) {
      throw new BadRequestException('Start date must be in the future');
    }

    if (end <= start) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check if car is available
    const car = await this.carRepository.findOne({
      where: { id: carId },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (car.status !== CarStatus.AVAILABLE) {
      throw new BadRequestException('Car is not available for rental');
    }

    // Check for conflicting rentals
    const conflictingRental = await this.historyRepository.findOne({
      where: {
        carId,
        status: In([RentalStatus.PENDING, RentalStatus.ACTIVE]),
        startDate: Between(start, end),
      },
    });

    if (conflictingRental) {
      throw new BadRequestException('Car is not available for the selected dates');
    }

    // Calculate duration and total cost
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalCost = car.dailyRate * duration;

    // Create rental history
    const rental = this.historyRepository.create({
      userId,
      carId,
      startDate: start,
      endDate: end,
      duration,
      totalCost,
      dailyRate: car.dailyRate,
      deposit: car.deposit,
      pickupLocation,
      returnLocation: dropoffLocation,
      status: RentalStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    const savedRental = await this.historyRepository.save(rental);

    // Update car status
    await this.carsService.updateStatus(carId, CarStatus.RESERVED);

    return savedRental;
  }

  async findAll(): Promise<History[]> {
    return this.historyRepository.find({
      relations: ['user', 'car'],
    });
  }

  async findOne(id: string): Promise<History> {
    const rental = await this.historyRepository.findOne({
      where: { id },
      relations: ['user', 'car'],
    });

    if (!rental) {
      throw new NotFoundException(`Rental with ID ${id} not found`);
    }

    return rental;
  }

  async findByUser(userId: string): Promise<History[]> {
    return this.historyRepository.find({
      where: { userId },
      relations: ['car'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCar(carId: string): Promise<History[]> {
    return this.historyRepository.find({
      where: { carId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateHistoryDto: any, userId: string, userRole: string): Promise<History> {
    const rental = await this.findOne(id);

    // Check if user can update this rental
    if (rental.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own rentals');
    }

    await this.historyRepository.update(id, updateHistoryDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const rental = await this.findOne(id);

    // Check if user can delete this rental
    if (rental.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own rentals');
    }

    await this.historyRepository.remove(rental);
  }

  async startRental(id: string): Promise<History> {
    const rental = await this.findOne(id);

    if (rental.status !== RentalStatus.PENDING) {
      throw new BadRequestException('Rental must be pending to start');
    }

    if (rental.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Payment must be completed before starting rental');
    }

    // Update rental status
    await this.historyRepository.update(id, {
      status: RentalStatus.ACTIVE,
    });

    // Update car status
    await this.carsService.updateStatus(rental.carId, CarStatus.RENTED);

    return this.findOne(id);
  }

  async completeRental(id: string, actualReturnDate?: Date, finalMileage?: number, notes?: string): Promise<History> {
    const rental = await this.findOne(id);

    if (rental.status !== RentalStatus.ACTIVE) {
      throw new BadRequestException('Rental must be active to complete');
    }

    const returnDate = actualReturnDate || new Date();
    const returnMileage = finalMileage || rental.car.mileage;

    // Calculate additional fees
    let lateFees = 0;
    let fuelFees = 0;
    let cleaningFees = 0;

    if (returnDate > rental.endDate) {
      const lateDays = Math.ceil((returnDate.getTime() - rental.endDate.getTime()) / (1000 * 60 * 60 * 24));
      lateFees = rental.dailyRate * lateDays;
    }

    // Update rental
    await this.historyRepository.update(id, {
      status: RentalStatus.COMPLETED,
      actualReturnDate: returnDate,
      finalMileage: returnMileage,
      lateFees,
      fuelFees,
      cleaningFees,
      notes,
    });

    // Update car status and earnings
    await this.carsService.updateStatus(rental.carId, CarStatus.AVAILABLE);
    await this.carsService.updateEarnings(rental.carId, rental.totalCost + lateFees + fuelFees + cleaningFees);

    // Update user stats
    await this.usersService.updateTotalSpent(rental.userId, rental.totalCost + lateFees + fuelFees + cleaningFees);

    return this.findOne(id);
  }

  async cancelRental(id: string, reason: string, userId: string, userRole: string): Promise<History> {
    const rental = await this.findOne(id);

    // Check if user can cancel this rental
    if (rental.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only cancel your own rentals');
    }

    if (rental.status === RentalStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed rental');
    }

    // Update rental status
    await this.historyRepository.update(id, {
      status: RentalStatus.CANCELLED,
      cancellationReason: reason,
    });

    // Update car status if it was reserved
    if (rental.status === RentalStatus.PENDING) {
      await this.carsService.updateStatus(rental.carId, CarStatus.AVAILABLE);
    }

    return this.findOne(id);
  }

  async extendRental(id: string, extensionDays: number): Promise<History> {
    const rental = await this.findOne(id);

    if (rental.status !== RentalStatus.ACTIVE) {
      throw new BadRequestException('Rental must be active to extend');
    }

    const extensionCost = rental.dailyRate * extensionDays;

    // Update rental
    await this.historyRepository.update(id, {
      endDate: new Date(rental.endDate.getTime() + extensionDays * 24 * 60 * 60 * 1000),
      duration: rental.duration + extensionDays,
      totalCost: rental.totalCost + extensionCost,
      isExtended: true,
      extensionDays,
      extensionCost,
    });

    return this.findOne(id);
  }

  async processPayment(id: string, paymentAmount: number): Promise<History> {
    const rental = await this.findOne(id);

    if (rental.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Rental is already paid');
    }

    if (paymentAmount < rental.totalCost) {
      throw new BadRequestException('Payment amount must cover the total cost');
    }

    // Update payment status
    await this.historyRepository.update(id, {
      paymentStatus: PaymentStatus.PAID,
    });

    return this.findOne(id);
  }

  async getRentalStats(userId?: string): Promise<any> {
    const queryBuilder = this.historyRepository
      .createQueryBuilder('rental')
      .leftJoin('rental.car', 'car')
      .leftJoin('rental.user', 'user');

    if (userId) {
      queryBuilder.where('rental.userId = :userId', { userId });
    }

    const stats = await queryBuilder
      .select([
        'COUNT(*) as totalRentals',
        'SUM(CASE WHEN rental.status = :completed THEN 1 ELSE 0 END) as completedRentals',
        'SUM(CASE WHEN rental.status = :active THEN 1 ELSE 0 END) as activeRentals',
        'SUM(CASE WHEN rental.status = :cancelled THEN 1 ELSE 0 END) as cancelledRentals',
        'SUM(rental.totalCost) as totalRevenue',
        'AVG(rental.totalCost) as averageRentalCost',
      ])
      .setParameters({
        completed: RentalStatus.COMPLETED,
        active: RentalStatus.ACTIVE,
        cancelled: RentalStatus.CANCELLED,
      })
      .getRawOne();

    return stats;
  }

  // Car availability and rental validation methods
  async checkCarAvailability(carId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const conflictingRental = await this.historyRepository.findOne({
      where: {
        carId,
        status: In([RentalStatus.PENDING, RentalStatus.ACTIVE]),
        startDate: Between(startDate, endDate),
      },
    });

    return !conflictingRental;
  }

  async getAvailableCars(startDate: Date, endDate: Date, location?: string): Promise<Car[]> {
    const queryBuilder = this.carRepository
      .createQueryBuilder('car')
      .where('car.status = :status', { status: CarStatus.AVAILABLE });

    if (location) {
      queryBuilder.andWhere('car.location ILIKE :location', { location: `%${location}%` });
    }

    const cars = await queryBuilder.getMany();
    const availableCars: Car[] = [];

    for (const car of cars) {
      const isAvailable = await this.checkCarAvailability(car.id, startDate, endDate);
      if (isAvailable) {
        availableCars.push(car);
      }
    }

    return availableCars;
  }

  async calculateRentalCost(carId: string, startDate: Date, endDate: Date): Promise<{
    dailyRate: number;
    duration: number;
    totalCost: number;
    deposit: number;
  }> {
    const car = await this.carRepository.findOne({ where: { id: carId } });
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Apply discounts for longer rentals
    let dailyRate = car.dailyRate;
    if (duration >= 7 && car.weeklyRate) {
      dailyRate = car.weeklyRate / 7;
    } else if (duration >= 30 && car.monthlyRate) {
      dailyRate = car.monthlyRate / 30;
    }

    const totalCost = dailyRate * duration;

    return {
      dailyRate,
      duration,
      totalCost,
      deposit: car.deposit
    };
  }
}
