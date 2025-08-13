import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { RankingService } from './ranking.service';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import { AdminOrUserGuard } from 'src/guard/userOrAdmin.guard';

@ApiTags('Rankings')
@ApiBearerAuth('JWT-auth')
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Post()
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Create a new ranking entry',
    description: 'Create a new ranking entry for cars, users, or other entities. This endpoint requires authentication.',
  })
  @ApiBody({
    type: CreateRankingDto,
    description: 'Ranking data',
    examples: {
      carRanking: {
        summary: 'Car Ranking',
        description: 'Create a ranking for a car based on performance',
        value: {
          entityType: 'CAR',
          entityId: '550e8400-e29b-41d4-a716-446655440000',
          category: 'PERFORMANCE',
          score: 95.5,
          rank: 1,
          totalEntries: 150,
          criteria: ['Fuel Efficiency', 'Customer Satisfaction', 'Reliability'],
          period: 'MONTHLY',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          notes: 'Top performing car for January 2024',
          metadata: {
            fuelEfficiency: 8.5,
            customerRating: 4.8,
            reliabilityScore: 9.2
          }
        } as unknown as CreateRankingDto
      },
      userRanking: {
        summary: 'User Ranking',
        description: 'Create a ranking for a user based on rental activity',
        value: {
          entityType: 'USER',
          entityId: '880e8400-e29b-41d4-a716-446655440000',
          category: 'RENTAL_ACTIVITY',
          score: 88.0,
          rank: 5,
          totalEntries: 200,
          criteria: ['Rental Frequency', 'Review Ratings', 'Payment History'],
          period: 'QUARTERLY',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          notes: 'Top 5 user for Q1 2024',
          metadata: {
            totalRentals: 15,
            averageRating: 4.6,
            paymentScore: 9.0
          }
        } as unknown as CreateRankingDto
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
    description: 'Ranking created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: 'bb0e8400-e29b-41d4-a716-446655440000' },
        entityType: { type: 'string', example: 'CAR' },
        entityId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        category: { type: 'string', example: 'PERFORMANCE' },
        score: { type: 'number', example: 95.5 },
        rank: { type: 'number', example: 1 },
        totalEntries: { type: 'number', example: 150 },
        period: { type: 'string', example: 'MONTHLY' },
        startDate: { type: 'string', format: 'date', example: '2024-01-01' },
        endDate: { type: 'string', format: 'date', example: '2024-01-31' },
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
        message: { type: 'array', items: { type: 'string' }, example: ['score must be a number', 'rank must be a positive integer'] },
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
    status: 409,
    description: 'Conflict - Ranking already exists for this entity and period',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Ranking already exists for this entity and period' }
      }
    }
  })
  create(@Body() createRankingDto: CreateRankingDto) {
    return this.rankingService.create(createRankingDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all rankings',
    description: 'Retrieve a list of all rankings with optional filtering and pagination.',
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
    name: 'entityType',
    description: 'Filter rankings by entity type',
    required: false,
    enum: ['CAR', 'USER', 'LOCATION', 'BRAND', 'MODEL'],
    example: 'CAR'
  })
  @ApiQuery({
    name: 'category',
    description: 'Filter rankings by category',
    required: false,
    enum: ['PERFORMANCE', 'POPULARITY', 'RENTAL_ACTIVITY', 'CUSTOMER_SATISFACTION', 'REVENUE'],
    example: 'PERFORMANCE'
  })
  @ApiQuery({
    name: 'period',
    description: 'Filter rankings by time period',
    required: false,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
    example: 'MONTHLY'
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Filter rankings starting from this date',
    required: false,
    type: String,
    format: 'date',
    example: '2024-01-01'
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Filter rankings ending before this date',
    required: false,
    type: String,
    format: 'date',
    example: '2024-12-31'
  })
  @ApiQuery({
    name: 'minScore',
    description: 'Minimum score filter',
    required: false,
    type: Number,
    example: 80
  })
  @ApiQuery({
    name: 'maxScore',
    description: 'Maximum score filter',
    required: false,
    type: Number,
    example: 100
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Sort rankings by field',
    required: false,
    enum: ['score', 'rank', 'createdAt', 'period'],
    example: 'score'
  })
  @ApiQuery({
    name: 'sortOrder',
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc'
  })
  @ApiResponse({
    status: 200,
    description: 'Rankings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        rankings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: 'bb0e8400-e29b-41d4-a716-446655440000' },
              entityType: { type: 'string', example: 'CAR' },
              entityId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              category: { type: 'string', example: 'PERFORMANCE' },
              score: { type: 'number', example: 95.5 },
              rank: { type: 'number', example: 1 },
              totalEntries: { type: 'number', example: 150 },
              period: { type: 'string', example: 'MONTHLY' },
              startDate: { type: 'string', format: 'date', example: '2024-01-01' },
              endDate: { type: 'string', format: 'date', example: '2024-01-31' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
            }
          }
        },
        total: { type: 'number', example: 500 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 50 },
        summary: {
          type: 'object',
          properties: {
            totalRankings: { type: 'number', example: 500 },
            averageScore: { type: 'number', example: 78.5 },
            topCategory: { type: 'string', example: 'PERFORMANCE' },
            mostActivePeriod: { type: 'string', example: 'MONTHLY' }
          }
        }
      }
    }
  })
  findAll() {
    return this.rankingService.findAll();
  }

  @Get('top/:entityType/:category')
  @ApiOperation({
    summary: 'Get top rankings by entity type and category',
    description: 'Retrieve the top rankings for a specific entity type and category.',
  })
  @ApiParam({
    name: 'entityType',
    description: 'Entity type to rank',
    enum: ['CAR', 'USER', 'LOCATION', 'BRAND', 'MODEL'],
    example: 'CAR'
  })
  @ApiParam({
    name: 'category',
    description: 'Category to rank by',
    enum: ['PERFORMANCE', 'POPULARITY', 'RENTAL_ACTIVITY', 'CUSTOMER_SATISFACTION', 'REVENUE'],
    example: 'PERFORMANCE'
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of top entries to return',
    required: false,
    type: Number,
    example: 10
  })
  @ApiQuery({
    name: 'period',
    description: 'Filter by time period',
    required: false,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
    example: 'MONTHLY'
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Filter starting from this date',
    required: false,
    type: String,
    format: 'date',
    example: '2024-01-01'
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Filter ending before this date',
    required: false,
    type: String,
    format: 'date',
    example: '2024-12-31'
  })
  @ApiResponse({
    status: 200,
    description: 'Top rankings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        entityType: { type: 'string', example: 'CAR' },
        category: { type: 'string', example: 'PERFORMANCE' },
        period: { type: 'string', example: 'MONTHLY' },
        totalEntries: { type: 'number', example: 150 },
        topRankings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              rank: { type: 'number', example: 1 },
              entityId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              entityName: { type: 'string', example: 'Toyota Camry 2023' },
              score: { type: 'number', example: 95.5 },
              previousRank: { type: 'number', example: 2 },
              rankChange: { type: 'number', example: 1 },
              metadata: {
                type: 'object',
                properties: {
                  fuelEfficiency: { type: 'number', example: 8.5 },
                  customerRating: { type: 'number', example: 4.8 },
                  reliabilityScore: { type: 'number', example: 9.2 }
                }
              }
            }
          }
        },
        summary: {
          type: 'object',
          properties: {
            averageScore: { type: 'number', example: 78.5 },
            scoreRange: { type: 'object', properties: { min: { type: 'number', example: 45.0 }, max: { type: 'number', example: 95.5 } } },
            distribution: { type: 'object', properties: { excellent: { type: 'number', example: 15 }, good: { type: 'number', example: 45 }, average: { type: 'number', example: 30 }, poor: { type: 'number', example: 10 } } }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid entity type or category',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid entity type or category' }
      }
    }
  })
  getTopRankings(
    @Param('entityType') entityType: string,
    @Param('category') category: string,
  ) {
    return this.rankingService.getTopRankings(entityType, category);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get ranking by ID',
    description: 'Retrieve detailed information about a specific ranking entry.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ranking ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: 'bb0e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: 'bb0e8400-e29b-41d4-a716-446655440000' },
        entityType: { type: 'string', example: 'CAR' },
        entityId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        category: { type: 'string', example: 'PERFORMANCE' },
        score: { type: 'number', example: 95.5 },
        rank: { type: 'number', example: 1 },
        totalEntries: { type: 'number', example: 150 },
        criteria: { type: 'array', items: { type: 'string' }, example: ['Fuel Efficiency', 'Customer Satisfaction', 'Reliability'] },
        period: { type: 'string', example: 'MONTHLY' },
        startDate: { type: 'string', format: 'date', example: '2024-01-01' },
        endDate: { type: 'string', format: 'date', example: '2024-01-31' },
        notes: { type: 'string', example: 'Top performing car for January 2024' },
        metadata: {
          type: 'object',
          properties: {
            fuelEfficiency: { type: 'number', example: 8.5 },
            customerRating: { type: 'number', example: 4.8 },
            reliabilityScore: { type: 'number', example: 9.2 },
            rentalCount: { type: 'number', example: 25 },
            revenue: { type: 'number', example: 1875.00 }
          }
        },
        previousRank: { type: 'number', example: 2 },
        rankChange: { type: 'number', example: 1 },
        scoreChange: { type: 'number', example: 2.5 },
        trend: { type: 'string', example: 'IMPROVING' },
        confidence: { type: 'number', example: 0.95 },
        lastUpdated: { type: 'string', format: 'date-time', example: '2024-01-31T23:59:59Z' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-31T23:59:59Z' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Ranking not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Ranking not found' }
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.rankingService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Update ranking',
    description: 'Update an existing ranking entry. Only administrators or the ranking owner can update rankings.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ranking ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: 'bb0e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    type: UpdateRankingDto,
    description: 'Ranking update data',
    examples: {
      score: {
        summary: 'Update Score',
        description: 'Update the ranking score',
        value: {
          score: 97.0,
          notes: 'Updated score based on new performance metrics'
        } as UpdateRankingDto
      },
      metadata: {
        summary: 'Update Metadata',
        description: 'Update ranking metadata',
        value: {
          metadata: {
            fuelEfficiency: 9.0,
            customerRating: 4.9,
            reliabilityScore: 9.5,
            rentalCount: 28,
            revenue: 2100.00
          }
        } as unknown as UpdateRankingDto
      },
      notes: {
        summary: 'Update Notes',
        description: 'Update ranking notes and comments',
        value: {
          notes: 'Updated notes with additional context about performance improvements',
          criteria: ['Fuel Efficiency', 'Customer Satisfaction', 'Reliability', 'Safety Features']
        } as UpdateRankingDto
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
    description: 'Ranking updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: 'bb0e8400-e29b-41d4-a716-446655440000' },
        score: { type: 'number', example: 97.0 },
        rank: { type: 'number', example: 1 },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-31T23:59:59Z' }
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
        message: { type: 'array', items: { type: 'string' }, example: ['score must be a number between 0 and 100'] },
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
    description: 'Forbidden - Only administrators or ranking owner can update rankings',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Only administrators or ranking owner can update rankings' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Ranking not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Ranking not found' }
      }
    }
  })
  update(@Param('id') id: string, @Body() updateRankingDto: UpdateRankingDto, @Request() req: any) {
    return this.rankingService.update(id, updateRankingDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Delete ranking',
    description: 'Delete an existing ranking entry. Only administrators or the ranking owner can delete rankings.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ranking ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: 'bb0e8400-e29b-41d4-a716-446655440000'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Ranking deleted successfully' },
        deletedRankingId: { type: 'string', format: 'uuid', example: 'bb0e8400-e29b-41d4-a716-446655440000' }
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
    description: 'Forbidden - Only administrators or ranking owner can delete rankings',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Only administrators or ranking owner can delete rankings' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Ranking not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Ranking not found' }
      }
    }
  })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.rankingService.remove(id, req.user.id, req.user.role);
  }
}
