import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In } from 'typeorm';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car, CarStatus, CarType, FuelType, TransmissionType } from './entities/car.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCarDto: CreateCarDto, ownerId: string): Promise<Car> {
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    if (owner.role !== UserRole.OWNER && owner.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only car owners can create cars');
    }

    const car = this.carRepository.create({
      ...createCarDto,
      ownerId,
      status: CarStatus.AVAILABLE,
      isAvailable: true,
    });

    return this.carRepository.save(car);
  }

  async findAll(query?: {
    type?: CarType;
    fuelType?: FuelType;
    transmission?: TransmissionType;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    available?: boolean;
    seats?: number;
    brand?: string;
    model?: string;
  }): Promise<Car[]> {
    const queryBuilder = this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.owner', 'owner')
      .select([
        'car.id',
        'car.brand',
        'car.model',
        'car.year',
        'car.type',
        'car.fuelType',
        'car.transmission',
        'car.engineSize',
        'car.horsepower',
        'car.mileage',
        'car.seats',
        'car.doors',
        'car.description',
        'car.dailyRate',
        'car.weeklyRate',
        'car.monthlyRate',
        'car.deposit',
        'car.status',
        'car.features',
        'car.images',
        'car.rating',
        'car.totalRentals',
        'car.location',
        'car.latitude',
        'car.longitude',
        'car.createdAt',
        'owner.id',
        'owner.firstName',
        'owner.lastName',
        'owner.rating',
      ]);

    if (query?.type) {
      queryBuilder.andWhere('car.type = :type', { type: query.type });
    }

    if (query?.fuelType) {
      queryBuilder.andWhere('car.fuelType = :fuelType', { fuelType: query.fuelType });
    }

    if (query?.transmission) {
      queryBuilder.andWhere('car.transmission = :transmission', { transmission: query.transmission });
    }

    if (query?.minPrice !== undefined) {
      queryBuilder.andWhere('car.dailyRate >= :minPrice', { minPrice: query.minPrice });
    }

    if (query?.maxPrice !== undefined) {
      queryBuilder.andWhere('car.dailyRate <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query?.location) {
      queryBuilder.andWhere('car.location ILIKE :location', { location: `%${query.location}%` });
    }

    if (query?.available !== undefined) {
      queryBuilder.andWhere('car.isAvailable = :available', { available: query.available });
    }

    if (query?.seats) {
      queryBuilder.andWhere('car.seats >= :seats', { seats: query.seats });
    }

    if (query?.brand) {
      queryBuilder.andWhere('car.brand ILIKE :brand', { brand: `%${query.brand}%` });
    }

    if (query?.model) {
      queryBuilder.andWhere('car.model ILIKE :model', { model: `%${query.model}%` });
    }

    // Only show available cars by default
    if (query?.available === undefined) {
      queryBuilder.andWhere('car.status = :status', { status: CarStatus.AVAILABLE });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carRepository.findOne({
      where: { id },
      relations: ['owner', 'reviews'],
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }

  async findByOwner(ownerId: string): Promise<Car[]> {
    return this.carRepository.find({
      where: { ownerId },
      relations: ['owner'],
    });
  }

  async update(id: string, updateCarDto: UpdateCarDto, userId: string, userRole: string): Promise<Car> {
    const car = await this.findOne(id);
    
    if (userRole !== UserRole.ADMIN && car.ownerId !== userId) {
      throw new ForbiddenException('Only car owner or admin can update car');
    }

    await this.carRepository.update(id, updateCarDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const car = await this.findOne(id);

    // Check if user can delete this car
    if (car.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own cars');
    }

    await this.carRepository.remove(car);
  }

  async updateStatus(id: string, status: CarStatus): Promise<Car> {
    const car = await this.findOne(id);
    
    await this.carRepository.update(id, { 
      status,
      isAvailable: status === CarStatus.AVAILABLE,
    });
    
    return this.findOne(id);
  }

  async updateRating(id: string, newRating: number): Promise<Car> {
    const car = await this.findOne(id);
    
    // Calculate new average rating
    const currentTotal = car.rating * car.totalRentals;
    const newTotal = currentTotal + newRating;
    const newTotalRentals = car.totalRentals + 1;
    const newAverageRating = newTotal / newTotalRentals;

    await this.carRepository.update(id, {
      rating: newAverageRating,
      totalRentals: newTotalRentals,
    });

    return this.findOne(id);
  }

  async updateEarnings(id: string, amount: number): Promise<Car> {
    const car = await this.findOne(id);
    
    await this.carRepository.update(id, {
      totalEarnings: car.totalEarnings + amount,
    });

    return this.findOne(id);
  }

  async searchCars(searchTerm: string): Promise<Car[]> {
    return this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.owner', 'owner')
      .where('car.brand ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('car.model ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('car.description ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('car.location ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .andWhere('car.status = :status', { status: CarStatus.AVAILABLE })
      .select([
        'car.id',
        'car.brand',
        'car.model',
        'car.year',
        'car.type',
        'car.dailyRate',
        'car.rating',
        'car.location',
        'car.images',
        'owner.id',
        'owner.firstName',
        'owner.lastName',
      ])
      .getMany();
  }

  async getCarsByLocation(latitude: number, longitude: number, radius: number = 50): Promise<Car[]> {
    // Simple distance calculation (you might want to use a more sophisticated approach)
    const cars = await this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.owner', 'owner')
      .where('car.latitude IS NOT NULL')
      .andWhere('car.longitude IS NOT NULL')
      .andWhere('car.status = :status', { status: CarStatus.AVAILABLE })
      .getMany();

    // Filter by distance (simplified calculation)
    return cars.filter(car => {
      const distance = Math.sqrt(
        Math.pow(car.latitude - latitude, 2) + Math.pow(car.longitude - longitude, 2)
      ) * 111; // Rough conversion to km
      return distance <= radius;
    });
  }

  async getPopularCars(limit: number = 10): Promise<Car[]> {
    return this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.owner', 'owner')
      .orderBy('car.totalRentals', 'DESC')
      .addOrderBy('car.rating', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getCarsByType(type: CarType): Promise<Car[]> {
    return this.carRepository.find({
      where: { type, status: CarStatus.AVAILABLE },
      relations: ['owner'],
    });
  }
}
