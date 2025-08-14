import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole, UserStatus } from './entities/user.entity';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { phoneNumber: createUserDto.phoneNumber },
      ],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const token = this.jwtService.sign({
      id: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });

    // Remove password from response by creating a new object
    const { password: userPassword, ...userWithoutPassword } = savedUser;

    return { user: userWithoutPassword as User, token };
  }



  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role', 'status', 'rating', 'totalRentals', 'createdAt'],
    });
    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role', 'status', 'rating', 'totalRentals', 'totalSpent', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email or phone number is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateUserDto.phoneNumber && updateUserDto.phoneNumber !== user.phoneNumber) {
      const existingUser = await this.userRepository.findOne({
        where: { phoneNumber: updateUserDto.phoneNumber },
      });
      if (existingUser) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'status'],
    });

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Get full user data without password
    const fullUser = await this.findOne(user.id);
    const { password: fullUserPassword, ...userWithoutPassword } = fullUser;

    return { user: userWithoutPassword as User, token };
  }

  async updateRating(id: string, newRating: number): Promise<User> {
    const user = await this.findOne(id);
    
    // Calculate new average rating
    const currentTotal = user.rating * user.totalRentals;
    const newTotal = currentTotal + newRating;
    const newTotalRentals = user.totalRentals + 1;
    const newAverageRating = newTotal / newTotalRentals;

    await this.userRepository.update(id, {
      rating: newAverageRating,
      totalRentals: newTotalRentals,
    });

    return this.findOne(id);
  }

  async updateTotalSpent(id: string, amount: number): Promise<User> {
    const user = await this.findOne(id);
    
    await this.userRepository.update(id, {
      totalSpent: user.totalSpent + amount,
    });

    return this.findOne(id);
  }

  async changeStatus(id: string, status: UserStatus): Promise<User> {
    await this.userRepository.update(id, { status });
    return this.findOne(id);
  }

  async verifyEmail(id: string): Promise<User> {
    await this.userRepository.update(id, { emailVerified: true });
    return this.findOne(id);
  }

  async verifyPhone(id: string): Promise<User> {
    await this.userRepository.update(id, { phoneVerified: true });
    return this.findOne(id);
  }
}
