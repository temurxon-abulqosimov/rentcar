import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { OwnerAuthGuard } from 'src/guard/owner.guard';
import { AdminOrUserGuard } from 'src/guard/userOrAdmin.guard';
import { FuelType, TransmissionType, CarType, CarStatus } from './entities/car.entity';

@ApiTags('Cars')
@ApiBearerAuth('JWT-auth')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  @UseGuards(OwnerAuthGuard)
  @ApiOperation({
    summary: 'Create a new car listing',
    description: 'Create a new car listing. This endpoint is restricted to car owners and administrators.',
  })
  @ApiBody({
    type: CreateCarDto,
    description: 'Car listing data',
    examples: {
      sedan: {
        summary: 'Sedan Car Listing',
        description: 'Create a sedan car listing',
        value: {
          brand: 'Toyota',
          model: 'Camry',
          year: 2023,
          licensePlate: 'ABC-123',
          vin: '1HGBH41JXMN109186',
          color: 'Silver',
          mileage: 15000,
          fuelType: FuelType.GASOLINE,
          transmission: TransmissionType.AUTOMATIC,
          type: CarType.SEDAN,
          seats: 5,
          doors: 4,
          engineSize: 2.5,
          horsepower: 200,
          dailyRate: 75.00,
          description: 'Comfortable sedan perfect for city driving',
          features: ['Bluetooth', 'GPS', 'Backup Camera'],
          location: '123 Main St, Downtown, City',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001'
        } as CreateCarDto
      },
      suv: {
        summary: 'SUV Car Listing',
        description: 'Create an SUV car listing',
        value: {
          brand: 'Honda',
          model: 'CR-V',
          year: 2022,
          licensePlate: 'XYZ-789',
          vin: '2HGBH41JXMN109187',
          color: 'Black',
          mileage: 25000,
          fuelType: FuelType.GASOLINE,
          transmission: TransmissionType.AUTOMATIC,
          type: CarType.SUV,
          seats: 7,
          doors: 5,
          engineSize: 1.5,
          horsepower: 190,
          dailyRate: 85.00,
          description: 'Spacious SUV perfect for family trips',
          features: ['All-Wheel Drive', 'Bluetooth', 'Apple CarPlay'],
          location: '456 Business Ave, Uptown, City',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          postalCode: '90210'
        } as CreateCarDto
      }
    }
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Car listing created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        brand: { type: 'string', example: 'Toyota' },
        model: { type: 'string', example: 'Camry' },
        year: { type: 'number', example: 2023 },
        licensePlate: { type: 'string', example: 'ABC-123' },
        vin: { type: 'string', example: '1HGBH41JXMN109186' },
        color: { type: 'string', example: 'Silver' },
        mileage: { type: 'number', example: 15000 },
        fuelType: { type: 'string', example: 'GASOLINE' },
        transmission: { type: 'string', example: 'AUTOMATIC' },
        type: { type: 'string', example: 'SEDAN' },
        seats: { type: 'number', example: 5 },
        doors: { type: 'number', example: 4 },
        engineSize: { type: 'number', example: 2.5 },
        horsepower: { type: 'number', example: 200 },
        dailyRate: { type: 'number', example: 75.00 },
        status: { type: 'string', example: 'AVAILABLE' },
        ownerId: { type: 'string', format: 'uuid', example: '660e8400-e29b-41d4-a716-446655440000' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
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
        message: { type: 'array', items: { type: 'string' }, example: ['brand must be a string', 'year must be a number'] },
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
    description: 'Forbidden - Only car owners and admins can create car listings',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Only car owners and admins can create car listings' }
      }
    }
  })
  create(@Body() createCarDto: CreateCarDto, @Request() req: any) {
    return this.carsService.create(createCarDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all cars',
    description: 'Retrieve a list of all available cars with optional filtering and pagination.',
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
    name: 'brand',
    description: 'Filter cars by brand',
    required: false,
    type: String,
    example: 'Toyota'
  })
  @ApiQuery({
    name: 'type',
    description: 'Filter cars by type',
    required: false,
    enum: ['SEDAN', 'SUV', 'HATCHBACK', 'COUPE', 'CONVERTIBLE', 'PICKUP', 'VAN'],
    example: 'SEDAN'
  })
  @ApiQuery({
    name: 'fuelType',
    description: 'Filter cars by fuel type',
    required: false,
    enum: ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUGIN_HYBRID'],
    example: 'GASOLINE'
  })
  @ApiQuery({
    name: 'transmission',
    description: 'Filter cars by transmission type',
    required: false,
    enum: ['MANUAL', 'AUTOMATIC', 'CVT', 'SEMI_AUTOMATIC'],
    example: 'AUTOMATIC'
  })
  @ApiQuery({
    name: 'minPrice',
    description: 'Minimum daily rate',
    required: false,
    type: Number,
    example: 50
  })
  @ApiQuery({
    name: 'maxPrice',
    description: 'Maximum daily rate',
    required: false,
    type: Number,
    example: 100
  })
  @ApiQuery({
    name: 'city',
    description: 'Filter cars by city',
    required: false,
    type: String,
    example: 'New York'
  })
  @ApiQuery({
    name: 'available',
    description: 'Filter by availability status',
    required: false,
    type: Boolean,
    example: true
  })
  @ApiResponse({
    status: 200,
    description: 'List of cars retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        cars: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              brand: { type: 'string', example: 'Toyota' },
              model: { type: 'string', example: 'Camry' },
              year: { type: 'number', example: 2023 },
              color: { type: 'string', example: 'Silver' },
              dailyRate: { type: 'number', example: 75.00 },
              status: { type: 'string', example: 'AVAILABLE' },
              city: { type: 'string', example: 'New York' },
              images: { type: 'array', items: { type: 'string' }, example: ['https://example.com/car1.jpg'] }
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
  findAll() {
    return this.carsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get car by ID',
    description: 'Retrieve detailed information about a specific car by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Car ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Car retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        brand: { type: 'string', example: 'Toyota' },
        model: { type: 'string', example: 'Camry' },
        year: { type: 'number', example: 2023 },
        licensePlate: { type: 'string', example: 'ABC-123' },
        vin: { type: 'string', example: '1HGBH41JXMN109186' },
        color: { type: 'string', example: 'Silver' },
        mileage: { type: 'number', example: 15000 },
        fuelType: { type: 'string', example: 'GASOLINE' },
        transmission: { type: 'string', example: 'AUTOMATIC' },
        type: { type: 'string', example: 'SEDAN' },
        seats: { type: 'number', example: 5 },
        doors: { type: 'number', example: 4 },
        engineSize: { type: 'number', example: 2.5 },
        horsepower: { type: 'number', example: 200 },
        dailyRate: { type: 'number', example: 75.00 },
        status: { type: 'string', example: 'AVAILABLE' },
        description: { type: 'string', example: 'Comfortable sedan perfect for city driving' },
        features: { type: 'array', items: { type: 'string' }, example: ['Bluetooth', 'GPS', 'Backup Camera'] },
        images: { type: 'array', items: { type: 'string' }, example: ['https://example.com/car1.jpg'] },
        location: { type: 'string', example: '123 Main St, Downtown, City' },
        city: { type: 'string', example: 'New York' },
        state: { type: 'string', example: 'NY' },
        country: { type: 'string', example: 'USA' },
        postalCode: { type: 'string', example: '10001' },
        latitude: { type: 'number', example: 40.7128 },
        longitude: { type: 'number', example: -74.0060 },
        ownerId: { type: 'string', format: 'uuid', example: '660e8400-e29b-41d4-a716-446655440000' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Car not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Car not found' }
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Update car listing',
    description: 'Update an existing car listing. Only the car owner or administrators can update car information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Car ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    type: UpdateCarDto,
    description: 'Car update data',
    examples: {
      price: {
        summary: 'Update Price',
        description: 'Update the daily rental rate',
        value: {
          dailyRate: 80.00
        } as UpdateCarDto
      },
      status: {
        summary: 'Update Status',
        description: 'Update car availability status',
        value: {
          status: CarStatus.MAINTENANCE,
          notes: 'Car is currently under maintenance'
        } as UpdateCarDto
      },
      features: {
        summary: 'Update Features',
        description: 'Add new features to the car',
        value: {
          features: ['Bluetooth', 'GPS', 'Backup Camera', 'Heated Seats', 'Sunroof']
        } as UpdateCarDto
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
    description: 'Car updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        brand: { type: 'string', example: 'Toyota' },
        model: { type: 'string', example: 'Camry' },
        dailyRate: { type: 'number', example: 80.00 },
        status: { type: 'string', example: 'AVAILABLE' },
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
        message: { type: 'array', items: { type: 'string' }, example: ['dailyRate must be a positive number'] },
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
    description: 'Forbidden - Only car owner or admin can update car listing',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Only car owner or admin can update car listing' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Car not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Car not found' }
      }
    }
  })
  update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto, @Request() req: any) {
    return this.carsService.update(id, updateCarDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Delete car listing',
    description: 'Delete a car listing from the system. Only the car owner or administrators can delete car listings.',
  })
  @ApiParam({
    name: 'id',
    description: 'Car ID (UUID)',
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
    description: 'Car listing deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Car listing deleted successfully' },
        deletedCarId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' }
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
    description: 'Forbidden - Only car owner or admin can delete car listing',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Only car owner or admin can delete car listing' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Car not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Car not found' }
      }
    }
  })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.carsService.remove(id, req.user.id, req.user.role);
  }
}
