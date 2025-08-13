import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { AdminOrUserGuard } from 'src/guard/userOrAdmin.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { RentalStatus } from './entities/history.entity';

@ApiTags('Rentals')
@ApiBearerAuth('JWT-auth')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Create a new car rental',
    description: 'Create a new car rental booking. This endpoint is restricted to customers and requires authentication.',
  })
  @ApiBody({
    type: CreateHistoryDto,
    description: 'Rental booking data',
    examples: {
      weekend: {
        summary: 'Weekend Rental',
        description: 'Create a weekend car rental',
        value: {
          carId: '550e8400-e29b-41d4-a716-446655440000',
          startDate: '2024-12-25T10:00:00Z',
          endDate: '2024-12-27T18:00:00Z',
          pickupLocation: '123 Main St, Downtown, City',
          dropoffLocation: '456 Business Ave, Uptown, City',
          notes: 'Please deliver the car with a full tank of gas',
          specialRequests: ['GPS navigation', 'Insurance coverage'],
          pickupInstructions: 'Meet at the main entrance of the building',
          dropoffInstructions: 'Leave the car in the designated parking area'
        } as CreateHistoryDto
      },
      business: {
        summary: 'Business Trip Rental',
        description: 'Create a business trip car rental',
        value: {
          carId: '660e8400-e29b-41d4-a716-446655440000',
          startDate: '2024-12-30T08:00:00Z',
          endDate: '2025-01-02T17:00:00Z',
          pickupLocation: 'Airport Terminal 1, Gate A',
          dropoffLocation: 'Airport Terminal 1, Gate A',
          notes: 'Business trip - need reliable transportation',
          specialRequests: ['Premium insurance', 'GPS navigation'],
          pickupInstructions: 'Meet at the car rental counter',
          dropoffInstructions: 'Return to the same location',
          rentalPurpose: 'Business trip'
        } as CreateHistoryDto
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
    description: 'Rental created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '770e8400-e29b-41d4-a716-446655440000' },
        carId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        userId: { type: 'string', format: 'uuid', example: '880e8400-e29b-41d4-a716-446655440000' },
        startDate: { type: 'string', format: 'date-time', example: '2024-12-25T10:00:00Z' },
        endDate: { type: 'string', format: 'date-time', example: '2024-12-27T18:00:00Z' },
        pickupLocation: { type: 'string', example: '123 Main St, Downtown, City' },
        dropoffLocation: { type: 'string', example: '456 Business Ave, Uptown, City' },
        status: { type: 'string', example: 'PENDING' },
        totalCost: { type: 'number', example: 225.00 },
        dailyRate: { type: 'number', example: 75.00 },
        duration: { type: 'number', example: 3 },
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
        message: { type: 'array', items: { type: 'string' }, example: ['startDate must be a valid date', 'endDate must be after startDate'] },
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
  @ApiResponse({
    status: 409,
    description: 'Car not available for selected dates',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Car is not available for the selected dates' }
      }
    }
  })
  create(@Body() createHistoryDto: CreateHistoryDto, @Request() req: any) {
    return this.historyService.createRental(createHistoryDto, req.user.id);
  }

  @Get()
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Get rental history',
    description: 'Retrieve rental history. Admins can see all rentals, while users can only see their own rentals.',
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
    name: 'status',
    description: 'Filter rentals by status',
    required: false,
    enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXTENDED'],
    example: 'ACTIVE'
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Filter rentals starting from this date',
    required: false,
    type: String,
    format: 'date',
    example: '2024-01-01'
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Filter rentals ending before this date',
    required: false,
    type: String,
    format: 'date',
    example: '2024-12-31'
  })
  @ApiResponse({
    status: 200,
    description: 'Rental history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        rentals: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '770e8400-e29b-41d4-a716-446655440000' },
              carId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              userId: { type: 'string', format: 'uuid', example: '880e8400-e29b-41d4-a716-446655440000' },
              startDate: { type: 'string', format: 'date-time', example: '2024-12-25T10:00:00Z' },
              endDate: { type: 'string', format: 'date-time', example: '2024-12-27T18:00:00Z' },
              status: { type: 'string', example: 'ACTIVE' },
              totalCost: { type: 'number', example: 225.00 },
              dailyRate: { type: 'number', example: 75.00 },
              duration: { type: 'number', example: 3 },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
            }
          }
        },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 5 }
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
  findAll(@Request() req: any) {
    const { userId, userRole } = req.user;
    if (userRole === UserRole.ADMIN) {
      return this.historyService.findAll();
    } else {
      return this.historyService.findByUser(userId);
    }
  }

  @Get(':id')
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Get rental by ID',
    description: 'Retrieve detailed information about a specific rental. Users can only access their own rentals unless they are administrators.',
  })
  @ApiParam({
    name: 'id',
    description: 'Rental ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: '770e8400-e29b-41d4-a716-446655440000'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Rental retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '770e8400-e29b-41d4-a716-446655440000' },
        carId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        userId: { type: 'string', format: 'uuid', example: '880e8400-e29b-41d4-a716-446655440000' },
        startDate: { type: 'string', format: 'date-time', example: '2024-12-25T10:00:00Z' },
        endDate: { type: 'string', format: 'date-time', example: '2024-12-27T18:00:00Z' },
        actualReturnDate: { type: 'string', format: 'date-time', example: '2024-12-27T16:00:00Z' },
        pickupLocation: { type: 'string', example: '123 Main St, Downtown, City' },
        dropoffLocation: { type: 'string', example: '456 Business Ave, Uptown, City' },
        status: { type: 'string', example: 'COMPLETED' },
        totalCost: { type: 'number', example: 225.00 },
        dailyRate: { type: 'number', example: 75.00 },
        duration: { type: 'number', example: 3 },
        deposit: { type: 'number', example: 100.00 },
        depositReturned: { type: 'number', example: 100.00 },
        lateFees: { type: 'number', example: 0.00 },
        damageFees: { type: 'number', example: 0.00 },
        fuelFees: { type: 'number', example: 0.00 },
        cleaningFees: { type: 'number', example: 0.00 },
        notes: { type: 'string', example: 'Please deliver the car with a full tank of gas' },
        specialRequests: { type: 'array', items: { type: 'string' }, example: ['GPS navigation', 'Insurance coverage'] },
        pickupInstructions: { type: 'string', example: 'Meet at the main entrance of the building' },
        dropoffInstructions: { type: 'string', example: 'Leave the car in the designated parking area' },
        emergencyContactName: { type: 'string', example: 'Jane Doe' },
        emergencyContactPhone: { type: 'string', example: '+1234567890' },
        insuranceType: { type: 'string', example: 'Comprehensive' },
        additionalDriver: { type: 'string', example: 'John Doe' },
        fuelPolicy: { type: 'string', example: 'Full to Full' },
        mileageLimit: { type: 'number', example: 500 },
        roadsideAssistance: { type: 'string', example: 'Included' },
        paymentMethod: { type: 'string', example: 'Credit Card' },
        discountCode: { type: 'string', example: 'SAVE20' },
        rentalPurpose: { type: 'string', example: 'Weekend trip' },
        expectedReturnTime: { type: 'string', format: 'date-time', example: '2024-12-27T16:00:00Z' },
        cleaningService: { type: 'string', example: 'Not included' },
        deliveryService: { type: 'string', example: 'Not included' },
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
    description: 'Forbidden - User can only access their own rentals',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You can only access your own rentals' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Rental not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Rental not found' }
      }
    }
  })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const { userId, userRole } = req.user;
    if (userRole !== UserRole.ADMIN) {
      // Check if user is accessing their own rental
      const rental = await this.historyService.findOne(id);
      if (rental && rental.userId !== userId) {
        throw new ForbiddenException('You can only access your own rentals');
      }
    }
    return this.historyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Update rental',
    description: 'Update an existing rental. Users can only update their own rentals unless they are administrators.',
  })
  @ApiParam({
    name: 'id',
    description: 'Rental ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: '770e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    type: UpdateHistoryDto,
    description: 'Rental update data',
    examples: {
      extend: {
        summary: 'Extend Rental',
        description: 'Extend the rental period',
        value: {
          endDate: '2024-12-28T18:00:00Z',
          notes: 'Extended rental for one more day'
        } as UpdateHistoryDto
      },
      updateLocation: {
        summary: 'Update Pickup Location',
        description: 'Change the pickup location',
        value: {
          pickupLocation: '789 New St, Downtown, City',
          pickupInstructions: 'Meet at the new location entrance'
        } as UpdateHistoryDto
      },
      cancel: {
        summary: 'Cancel Rental',
        description: 'Cancel the rental',
        value: {
          status: RentalStatus.CANCELLED,
          notes: 'Trip cancelled due to weather conditions'
        } as UpdateHistoryDto
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
    description: 'Rental updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '770e8400-e29b-41d4-a716-446655440000' },
        status: { type: 'string', example: 'ACTIVE' },
        endDate: { type: 'string', format: 'date-time', example: '2024-12-28T18:00:00Z' },
        totalCost: { type: 'number', example: 300.00 },
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
        message: { type: 'array', items: { type: 'string' }, example: ['endDate must be after startDate'] },
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
    description: 'Forbidden - User can only update their own rentals',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You can only update your own rentals' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Rental not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Rental not found' }
      }
    }
  })
  update(@Param('id') id: string, @Body() updateHistoryDto: UpdateHistoryDto, @Request() req: any) {
    return this.historyService.update(id, updateHistoryDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Cancel rental',
    description: 'Cancel an existing rental. Users can only cancel their own rentals unless they are administrators.',
  })
  @ApiParam({
    name: 'id',
    description: 'Rental ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: '770e8400-e29b-41d4-a716-446655440000'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Rental cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Rental cancelled successfully' },
        cancelledRentalId: { type: 'string', format: 'uuid', example: '770e8400-e29b-41d4-a716-446655440000' },
        refundAmount: { type: 'number', example: 150.00 }
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
    description: 'Forbidden - User can only cancel their own rentals',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You can only cancel your own rentals' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Rental not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Rental not found' }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Rental cannot be cancelled',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Rental is already active and cannot be cancelled' }
      }
    }
  })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.historyService.remove(id, req.user.id, req.user.role);
  }
}
