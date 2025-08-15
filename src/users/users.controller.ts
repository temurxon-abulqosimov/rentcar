import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminOrUserGuard } from '../guard/userOrAdmin.guard';
import { UserRole } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account. No authentication required.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User registration data',
    examples: {
      customer: {
        summary: 'Customer Registration',
        description: 'Register a new customer account',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1234567890',
          password: 'securePassword123',
          dateOfBirth: '1990-01-01',
          address: '123 Main St, Downtown, City',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001',
          driverLicenseNumber: 'DL123456789',
          driverLicenseExpiry: '2025-12-31',
          emergencyContactName: 'Jane Doe',
          emergencyContactPhone: '+1234567891',
          emergencyContactRelationship: 'Spouse',
          preferences: {
            preferredCarTypes: ['sedan', 'suv'],
            preferredFuelTypes: ['gasoline', 'hybrid'],
            preferredTransmission: 'automatic',
            maxDailyRate: 100,
            preferredPickupLocation: 'Downtown'
          }
        } as CreateUserDto
      },
      owner: {
        summary: 'Car Owner Registration',
        description: 'Register a new car owner account',
        value: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          phoneNumber: '+1234567892',
          password: 'securePassword456',
          role: UserRole.OWNER,
          dateOfBirth: '1985-05-15',
          address: '456 Business Ave, Uptown, City',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          postalCode: '90210',
          driverLicenseNumber: 'DL987654321',
          driverLicenseExpiry: '2026-06-30',
          businessName: 'Johnson Car Rentals',
          businessLicense: 'BL789456123',
          insuranceProvider: 'SafeDrive Insurance',
          insurancePolicyNumber: 'POL123456789',
          emergencyContactName: 'Mike Johnson',
          emergencyContactPhone: '+1234567893',
          emergencyContactRelationship: 'Business Partner',
          preferences: {
            preferredCarTypes: ['sedan', 'suv', 'luxury'],
            preferredFuelTypes: ['gasoline', 'hybrid', 'electric'],
            preferredTransmission: 'automatic',
            maxDailyRate: 200,
            preferredPickupLocation: 'Multiple locations'
          }
        } as unknown as CreateUserDto
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phoneNumber: { type: 'string', example: '+1234567890' },
            role: { type: 'string', example: 'CUSTOMER' },
            status: { type: 'string', example: 'ACTIVE' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
          }
        },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        message: { type: 'string', example: 'User registered successfully' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' }, example: ['email must be an email', 'password must be longer than or equal to 8 characters'] },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User with this email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'User with this email already exists' }
      }
    }
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return JWT token. No authentication required.',
  })
  @ApiBody({
    description: 'Login credentials',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'john.doe@example.com',
          description: 'User email address'
        },
        password: {
          type: 'string',
          example: 'securePassword123',
          description: 'User password'
        }
      }
    },
    examples: {
      customer: {
        summary: 'Customer Login',
        description: 'Login with customer credentials',
        value: {
          email: 'john.doe@example.com',
          password: 'securePassword123'
        }
      },
      owner: {
        summary: 'Owner Login',
        description: 'Login with car owner credentials',
        value: {
          email: 'sarah.johnson@example.com',
          password: 'securePassword456'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phoneNumber: { type: 'string', example: '+1234567890' },
            role: { type: 'string', example: 'CUSTOMER' },
            status: { type: 'string', example: 'ACTIVE' },
            lastLoginAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
          }
        },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        message: { type: 'string', example: 'Login successful' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Missing email or password',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Email and password are required' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid email or password' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Account is suspended or inactive',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Account is suspended. Please contact support.' }
      }
    }
  })
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.usersService.login(loginDto.email, loginDto.password);
  }

  @Get('profile')
  @UseGuards(AdminOrUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieve the current user\'s profile information. Requires authentication.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        phoneNumber: { type: 'string', example: '+1234567890' },
        role: { type: 'string', example: 'CUSTOMER' },
        status: { type: 'string', example: 'ACTIVE' },
        dateOfBirth: { type: 'string', format: 'date', example: '1990-01-01' },
        address: { type: 'string', example: '123 Main St, Downtown, City' },
        city: { type: 'string', example: 'New York' },
        state: { type: 'string', example: 'NY' },
        country: { type: 'string', example: 'USA' },
        postalCode: { type: 'string', example: '10001' },
        driverLicenseNumber: { type: 'string', example: 'DL123456789' },
        driverLicenseExpiry: { type: 'string', format: 'date', example: '2025-12-31' },
        emergencyContactName: { type: 'string', example: 'Jane Doe' },
        emergencyContactPhone: { type: 'string', example: '+1234567891' },
        emergencyContactRelationship: { type: 'string', example: 'Spouse' },
        preferences: {
          type: 'object',
          properties: {
            preferredCarTypes: { type: 'array', items: { type: 'string' }, example: ['sedan', 'suv'] },
            preferredFuelTypes: { type: 'array', items: { type: 'string' }, example: ['gasoline', 'hybrid'] },
            preferredTransmission: { type: 'string', example: 'automatic' },
            maxDailyRate: { type: 'number', example: 100 },
            preferredPickupLocation: { type: 'string', example: 'Downtown' }
          }
        },
        rating: { type: 'number', example: 4.5 },
        totalRentals: { type: 'number', example: 15 },
        memberSince: { type: 'string', format: 'date', example: '2024-01-01' },
        lastLoginAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Get()
  @UseGuards(AdminOrUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users. This endpoint is restricted to administrators.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: Number,
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
    type: Number,
    example: 10
  })
  @ApiQuery({
    name: 'role',
    description: 'Filter users by role',
    required: false,
    enum: ['CUSTOMER', 'OWNER', 'ADMIN'],
    example: 'CUSTOMER'
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter users by status',
    required: false,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'],
    example: 'ACTIVE'
  })
  @ApiQuery({
    name: 'city',
    description: 'Filter users by city',
    required: false,
    type: String,
    example: 'New York'
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              firstName: { type: 'string', example: 'John' },
              lastName: { type: 'string', example: 'Doe' },
              email: { type: 'string', example: 'john.doe@example.com' },
              phoneNumber: { type: 'string', example: '+1234567890' },
              role: { type: 'string', example: 'CUSTOMER' },
              status: { type: 'string', example: 'ACTIVE' },
              city: { type: 'string', example: 'New York' },
              rating: { type: 'number', example: 4.5 },
              totalRentals: { type: 'number', example: 15 },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
            }
          }
        },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 15 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only administrators can access this endpoint',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Only administrators can access this endpoint' }
      }
    }
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminOrUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve detailed information about a specific user. Users can only access their own profile unless they are administrators.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        phoneNumber: { type: 'string', example: '+1234567890' },
        role: { type: 'string', example: 'CUSTOMER' },
        status: { type: 'string', example: 'ACTIVE' },
        profilePicture: { type: 'string', example: 'https://example.com/profile.jpg' },
        dateOfBirth: { type: 'string', format: 'date', example: '1990-01-01' },
        address: { type: 'string', example: '123 Main St, Downtown, City' },
        city: { type: 'string', example: 'New York' },
        state: { type: 'string', example: 'NY' },
        country: { type: 'string', example: 'USA' },
        postalCode: { type: 'string', example: '10001' },
        driverLicenseNumber: { type: 'string', example: 'DL123456789' },
        driverLicenseExpiry: { type: 'string', format: 'date', example: '2025-12-31' },
        businessName: { type: 'string', example: null },
        businessLicense: { type: 'string', example: null },
        insuranceProvider: { type: 'string', example: null },
        insurancePolicyNumber: { type: 'string', example: null },
        emergencyContactName: { type: 'string', example: 'Jane Doe' },
        emergencyContactPhone: { type: 'string', example: '+1234567891' },
        emergencyContactRelationship: { type: 'string', example: 'Spouse' },
        preferences: {
          type: 'object',
          properties: {
            preferredCarTypes: { type: 'array', items: { type: 'string' }, example: ['sedan', 'suv'] },
            preferredFuelTypes: { type: 'array', items: { type: 'string' }, example: ['gasoline', 'hybrid'] },
            preferredTransmission: { type: 'string', example: 'automatic' },
            maxDailyRate: { type: 'number', example: 100 },
            preferredPickupLocation: { type: 'string', example: 'Downtown' }
          }
        },
        rating: { type: 'number', example: 4.5 },
        totalRentals: { type: 'number', example: 15 },
        totalSpent: { type: 'number', example: 1250.00 },
        memberSince: { type: 'string', format: 'date', example: '2024-01-01' },
        lastLoginAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
        lastLoginIp: { type: 'string', example: '192.168.1.1' },
        lastLoginLocation: { type: 'string', example: 'New York, USA' },
        isOnline: { type: 'boolean', example: false },
        twoFactorEnabled: { type: 'boolean', example: false },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User can only access their own profile',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You can only access your own profile' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  findOne(@Param('id') id: string, @Request() req: any) {
    const { userId, userRole } = req.user;
    if (userRole !== UserRole.ADMIN && userId !== id) {
      throw new ForbiddenException('You can only access your own profile');
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminOrUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update an existing user. Users can only update their own profile unless they are administrators.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data',
    examples: {
      profile: {
        summary: 'Update Profile',
        description: 'Update basic profile information',
        value: {
          firstName: 'Johnny',
          lastName: 'Smith',
          phoneNumber: '+1234567899',
          address: '789 New St, Downtown, City'
        } as UpdateUserDto
      },
      preferences: {
        summary: 'Update Preferences',
        description: 'Update user preferences',
        value: {
          preferences: {
            preferredCarTypes: ['sedan', 'suv', 'luxury'],
            preferredFuelTypes: ['gasoline', 'hybrid'],
            preferredTransmission: 'automatic',
            maxDailyRate: 150,
            preferredPickupLocation: 'Downtown or Airport'
          }
        } as UpdateUserDto
      },
      business: {
        summary: 'Update Business Info',
        description: 'Update business information for car owners',
        value: {
          businessName: 'Premium Car Rentals',
          businessLicense: 'BL456789123',
          insuranceProvider: 'Elite Insurance Co',
          insurancePolicyNumber: 'POL987654321'
        } as UpdateUserDto
      }
    }
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        firstName: { type: 'string', example: 'Johnny' },
        lastName: { type: 'string', example: 'Smith' },
        phoneNumber: { type: 'string', example: '+1234567899' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' }, example: ['phoneNumber must be a valid phone number'] },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User can only update their own profile',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You can only update your own profile' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: any) {
    const { userId, userRole } = req.user;
    if (userRole !== UserRole.ADMIN && userId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AdminOrUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete an existing user. Users can only delete their own profile unless they are administrators.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User deleted successfully' },
        deletedUserId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User can only delete their own profile',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You can only delete your own profile' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  remove(@Param('id') id: string, @Request() req: any) {
    const { userId, userRole } = req.user;
    if (userRole !== UserRole.ADMIN && userId !== id) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    return this.usersService.remove(id);
  }
}
