import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { User, UserStatus, UserRole } from '../users/entities/user.entity';
import { Car, CarStatus } from '../cars/entities/car.entity';
import { History, RentalStatus } from '../history/entities/history.entity';
import { Review } from '../reviews/entities/review.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly jwtService: JwtService,
  ) {}

  async createAdmin(createAdminDto: any): Promise<{ admin: Admin; token: string }> {
    // Check if admin already exists
    const existingAdmin = await this.adminRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    // Create admin entity directly with all required fields
    const admin = new Admin();
    admin.firstName = createAdminDto.firstName;
    admin.lastName = createAdminDto.lastName;
    admin.email = createAdminDto.email;
    admin.phoneNumber = createAdminDto.phoneNumber;
    admin.password = hashedPassword;
    
    // Set optional fields if provided
    if (createAdminDto.role) admin.role = createAdminDto.role;
    if (createAdminDto.status) admin.status = createAdminDto.status;
    if (createAdminDto.permissions) admin.permissions = createAdminDto.permissions;
    if (createAdminDto.profilePicture) admin.profilePicture = createAdminDto.profilePicture;
    if (createAdminDto.employeeId) admin.employeeId = createAdminDto.employeeId;
    if (createAdminDto.hireDate) admin.hireDate = new Date(createAdminDto.hireDate);
    if (createAdminDto.department) admin.department = createAdminDto.department;
    if (createAdminDto.supervisor) admin.supervisor = createAdminDto.supervisor;
    if (createAdminDto.assignedRegions) admin.assignedRegions = createAdminDto.assignedRegions;
    if (createAdminDto.totalActions !== undefined) admin.totalActions = createAdminDto.totalActions;
    if (createAdminDto.successfulActions !== undefined) admin.successfulActions = createAdminDto.successfulActions;
    if (createAdminDto.failedActions !== undefined) admin.failedActions = createAdminDto.failedActions;
    if (createAdminDto.lastLoginIp) admin.lastLoginIp = createAdminDto.lastLoginIp;
    if (createAdminDto.lastLoginLocation) admin.lastLoginLocation = createAdminDto.lastLoginLocation;
    if (createAdminDto.isOnline !== undefined) admin.isOnline = createAdminDto.isOnline;
    if (createAdminDto.notes) admin.notes = createAdminDto.notes;
    if (createAdminDto.requiresPasswordChange !== undefined) admin.requiresPasswordChange = createAdminDto.requiresPasswordChange;
    if (createAdminDto.twoFactorEnabled !== undefined) admin.twoFactorEnabled = createAdminDto.twoFactorEnabled;

    const savedAdmin = await this.adminRepository.save(admin);

    // Generate JWT token
    const token = this.jwtService.sign({
      id: savedAdmin.id,
      email: savedAdmin.email,
      role: UserRole.ADMIN,
    });

    // Remove password from response by creating a new object
    const { password, ...adminWithoutPassword } = savedAdmin;

    return { admin: adminWithoutPassword as Admin, token };
  }

  async adminLogin(email: string, password: string): Promise<{ admin: Admin; token: string }> {
    const admin = await this.adminRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });

    if (!admin) {
      throw new NotFoundException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      id: admin.id,
      email: admin.email,
      role: UserRole.ADMIN,
    });

    // Get full admin data without password
    const fullAdmin = await this.adminRepository.findOne({
      where: { id: admin.id },
    });

    if (!fullAdmin) {
      throw new NotFoundException('Admin not found');
    }

    // Remove password from response by creating a new object
    const { password: adminPassword, ...adminWithoutPassword } = fullAdmin;

    return { admin: adminWithoutPassword as Admin, token };
  }

  async findAllAdmins(): Promise<Admin[]> {
    const admins = await this.adminRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt'],
    });
    return admins;
  }

  async findOneAdmin(id: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return admin;
  }

  async updateAdmin(id: string, updateAdminDto: any): Promise<Admin> {
    const admin = await this.findOneAdmin(id);

    // Hash password if it's being updated
    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    await this.adminRepository.update(id, updateAdminDto);
    return this.findOneAdmin(id);
  }

  async removeAdmin(id: string): Promise<void> {
    const admin = await this.findOneAdmin(id);
    await this.adminRepository.remove(admin);
  }

  // User Management
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role', 'status', 'rating', 'totalRentals', 'totalSpent', 'createdAt'],
    });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role', 'status', 'rating', 'totalRentals', 'totalSpent', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.getUserById(id);
    
    await this.userRepository.update(id, { status });
    return this.getUserById(id);
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const user = await this.getUserById(id);
    
    await this.userRepository.update(id, { role });
    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    
    // Check if user has active rentals
    const activeRentals = await this.historyRepository.find({
      where: {
        userId: id,
        status: In([RentalStatus.PENDING, RentalStatus.ACTIVE]),
      },
    });

    if (activeRentals.length > 0) {
      throw new BadRequestException('Cannot delete user with active rentals');
    }

    await this.userRepository.remove(user);
  }

  // Car Management
  async getAllCars(): Promise<Car[]> {
    return this.carRepository.find({
      relations: ['owner'],
    });
  }

  async getCarById(id: string): Promise<Car> {
    const car = await this.carRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }

  async updateCarStatus(id: string, status: CarStatus): Promise<Car> {
    const car = await this.getCarById(id);
    
    await this.carRepository.update(id, { 
      status,
      isAvailable: status === CarStatus.AVAILABLE,
    });
    
    return this.getCarById(id);
  }

  async deleteCar(id: string): Promise<void> {
    const car = await this.getCarById(id);
    
    // Check if car has active rentals
    const activeRentals = await this.historyRepository.find({
      where: {
        carId: id,
        status: In([RentalStatus.PENDING, RentalStatus.ACTIVE]),
      },
    });

    if (activeRentals.length > 0) {
      throw new BadRequestException('Cannot delete car with active rentals');
    }

    await this.carRepository.remove(car);
  }

  // Rental Management
  async getAllRentals(): Promise<History[]> {
    return this.historyRepository.find({
      relations: ['user', 'car'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRentalById(id: string): Promise<History> {
    const rental = await this.historyRepository.findOne({
      where: { id },
      relations: ['user', 'car'],
    });

    if (!rental) {
      throw new NotFoundException(`Rental with ID ${id} not found`);
    }

    return rental;
  }

  async updateRentalStatus(id: string, status: RentalStatus): Promise<History> {
    const rental = await this.getRentalById(id);
    
    await this.historyRepository.update(id, { status });
    return this.getRentalById(id);
  }

  // Review Management
  async getAllReviews(): Promise<Review[]> {
    return this.reviewRepository.find({
      relations: ['user', 'car'],
      order: { createdAt: 'DESC' },
    });
  }

  async getReviewById(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'car'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async deleteReview(id: string): Promise<void> {
    const review = await this.getReviewById(id);
    await this.reviewRepository.remove(review);
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<any> {
    const [
      totalUsers,
      totalCars,
      totalRentals,
      totalReviews,
      activeRentals,
      pendingRentals,
      totalRevenue,
    ] = await Promise.all([
      this.userRepository.count(),
      this.carRepository.count(),
      this.historyRepository.count(),
      this.reviewRepository.count(),
      this.historyRepository.count({ where: { status: RentalStatus.ACTIVE } }),
      this.historyRepository.count({ where: { status: RentalStatus.PENDING } }),
      this.historyRepository
        .createQueryBuilder('rental')
        .select('SUM(rental.totalCost)', 'total')
        .where('rental.status = :status', { status: RentalStatus.COMPLETED })
        .getRawOne(),
    ]);

    return {
      totalUsers,
      totalCars,
      totalRentals,
      totalReviews,
      activeRentals,
      pendingRentals,
      totalRevenue: totalRevenue?.total || 0,
    };
  }

  async getUserStats(): Promise<any> {
    const userStats = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.role',
        'COUNT(*) as count',
        'AVG(user.rating) as averageRating',
        'SUM(user.totalRentals) as totalRentals',
        'SUM(user.totalSpent) as totalSpent',
      ])
      .groupBy('user.role')
      .getRawMany();

    return userStats;
  }

  async getCarStats(): Promise<any> {
    const carStats = await this.carRepository
      .createQueryBuilder('car')
      .select([
        'car.type',
        'COUNT(*) as count',
        'AVG(car.rating) as averageRating',
        'SUM(car.totalRentals) as totalRentals',
        'SUM(car.totalEarnings) as totalEarnings',
      ])
      .groupBy('car.type')
      .getRawMany();

    return carStats;
  }

  async getRentalStats(): Promise<any> {
    const rentalStats = await this.historyRepository
      .createQueryBuilder('rental')
      .select([
        'rental.status',
        'COUNT(*) as count',
        'AVG(rental.totalCost) as averageCost',
        'SUM(rental.totalCost) as totalCost',
      ])
      .groupBy('rental.status')
      .getRawMany();

    return rentalStats;
  }
}
