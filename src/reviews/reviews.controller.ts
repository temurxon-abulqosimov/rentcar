import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AdminOrUserGuard } from '../guard/userOrAdmin.guard';

@ApiTags('Reviews')
@ApiBearerAuth('JWT-auth')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Create a new review',
    description: 'Create a new review for a car rental experience. This endpoint requires authentication.',
  })
  @ApiBody({
    type: CreateReviewDto,
    description: 'Review data',
    examples: {
      positive: {
        summary: 'Positive Review',
        description: 'Create a positive review for a great experience',
        value: {
          carId: '9328109d-ad19-4a43-a4f8-2b34361aeb6d',
          historyId: '25870122-f423-4703-a86f-5fe98881e344',
          rating: 5,
          title: 'Excellent car rental experience!',
          content: 'The car was in perfect condition and the rental process was smooth. Highly recommend!',
          cleanlinessRating: 5,
          comfortRating: 5,
          performanceRating: 5,
          valueRating: 5,
          customerServiceRating: 5,
          tags: ['Great Experience', 'Clean Car', 'Good Value'],
          featureComments: 'The GPS navigation was very helpful for city driving',
          processComments: 'Pickup and drop-off were very convenient',
          conditionComments: 'Car was spotless and well-maintained'
        } as CreateReviewDto
      },
      mixed: {
        summary: 'Mixed Review',
        description: 'Create a review with both positive and negative aspects',
        value: {
          carId: '550e8400-e29b-41d4-a716-446655440000',
          historyId: '660e8400-e29b-41d4-a716-446655440000',
          rating: 4,
          title: 'Good car, minor issues',
          content: 'Overall good experience but there were some minor issues with the pickup process.',
          cleanlinessRating: 4,
          comfortRating: 5,
          performanceRating: 4,
          valueRating: 4,
          customerServiceRating: 3,
          tags: ['Good Value', 'Minor Issues'],
          featureComments: 'Car features worked well',
          processComments: 'Pickup was a bit delayed',
          conditionComments: 'Car was clean and well-maintained'
        } as CreateReviewDto
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
    description: 'Review created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '990e8400-e29b-41d4-a716-446655440000' },
        carId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        historyId: { type: 'string', format: 'uuid', example: '660e8400-e29b-41d4-a716-446655440000' },
        userId: { type: 'string', format: 'uuid', example: '880e8400-e29b-41d4-a716-446655440000' },
        rating: { type: 'number', example: 5 },
        title: { type: 'string', example: 'Excellent car rental experience!' },
        content: { type: 'string', example: 'The car was in perfect condition and the rental process was smooth. Highly recommend!' },
        cleanlinessRating: { type: 'number', example: 5 },
        comfortRating: { type: 'number', example: 5 },
        performanceRating: { type: 'number', example: 5 },
        valueRating: { type: 'number', example: 5 },
        customerServiceRating: { type: 'number', example: 5 },
        tags: { type: 'array', items: { type: 'string' }, example: ['Great Experience', 'Clean Car', 'Good Value'] },
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
        message: { type: 'array', items: { type: 'string' }, example: ['rating must be a number', 'title must be a string'] },
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
    description: 'Car or rental history not found',
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
    description: 'Review already exists for this rental',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Review already exists for this rental' }
      }
    }
  })
  create(@Body() createReviewDto: CreateReviewDto, @Request() req: any) {
    return this.reviewsService.create(createReviewDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all reviews',
    description: 'Retrieve a list of all reviews with optional filtering and pagination.',
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
    name: 'rating',
    description: 'Filter reviews by rating',
    required: false,
    type: Number,
    minimum: 1,
    maximum: 5,
    example: 5
  })
  @ApiQuery({
    name: 'carId',
    description: 'Filter reviews by car ID',
    required: false,
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiQuery({
    name: 'userId',
    description: 'Filter reviews by user ID',
    required: false,
    type: String,
    format: 'uuid',
    example: '880e8400-e29b-41d4-a716-446655440000'
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Sort reviews by field',
    required: false,
    enum: ['rating', 'createdAt', 'helpfulCount'],
    example: 'rating'
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
    description: 'Reviews retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        reviews: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '990e8400-e29b-41d4-a716-446655440000' },
              carId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              userId: { type: 'string', format: 'uuid', example: '880e8400-e29b-41d4-a716-446655440000' },
              rating: { type: 'number', example: 5 },
              title: { type: 'string', example: 'Excellent car rental experience!' },
              content: { type: 'string', example: 'The car was in perfect condition...' },
              tags: { type: 'array', items: { type: 'string' }, example: ['Great Experience', 'Clean Car'] },
              helpfulCount: { type: 'number', example: 3 },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
            }
          }
        },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 15 },
        averageRating: { type: 'number', example: 4.2 },
        totalReviews: { type: 'number', example: 150 }
      }
    }
  })
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get review by ID',
    description: 'Retrieve detailed information about a specific review.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: '990e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '990e8400-e29b-41d4-a716-446655440000' },
        carId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        historyId: { type: 'string', format: 'uuid', example: '660e8400-e29b-41d4-a716-446655440000' },
        userId: { type: 'string', format: 'uuid', example: '880e8400-e29b-41d4-a716-446655440000' },
        rating: { type: 'number', example: 5 },
        title: { type: 'string', example: 'Excellent car rental experience!' },
        content: { type: 'string', example: 'The car was in perfect condition and the rental process was smooth. Highly recommend!' },
        cleanlinessRating: { type: 'number', example: 5 },
        comfortRating: { type: 'number', example: 5 },
        performanceRating: { type: 'number', example: 5 },
        valueRating: { type: 'number', example: 5 },
        customerServiceRating: { type: 'number', example: 5 },
        tags: { type: 'array', items: { type: 'string' }, example: ['Great Experience', 'Clean Car', 'Good Value'] },
        photos: { type: 'array', items: { type: 'string' }, example: ['https://example.com/review1.jpg'] },
        anonymous: { type: 'string', example: 'false' },
        verified: { type: 'string', example: 'true' },
        helpfulCount: { type: 'number', example: 3 },
        unhelpfulCount: { type: 'number', example: 0 },
        hasResponse: { type: 'string', example: 'false' },
        status: { type: 'string', example: 'published' },
        featureComments: { type: 'string', example: 'The GPS navigation was very helpful for city driving' },
        processComments: { type: 'string', example: 'Pickup and drop-off were very convenient' },
        conditionComments: { type: 'string', example: 'Car was spotless and well-maintained' },
        recommendationLevel: { type: 'number', example: 10 },
        wouldRentAgain: { type: 'string', example: 'true' },
        wouldRecommend: { type: 'string', example: 'true' },
        language: { type: 'string', example: 'en' },
        source: { type: 'string', example: 'web' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Review not found' }
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Update review',
    description: 'Update an existing review. Users can only update their own reviews unless they are administrators.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: '990e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    type: UpdateReviewDto,
    description: 'Review update data',
    examples: {
      rating: {
        summary: 'Update Rating',
        description: 'Update the review rating',
        value: {
          rating: 4,
          content: 'Updated review content with new rating'
        } as UpdateReviewDto
      },
      content: {
        summary: 'Update Content',
        description: 'Update the review content',
        value: {
          title: 'Updated review title',
          content: 'This is the updated review content with more details about the experience.'
        } as UpdateReviewDto
      },
      tags: {
        summary: 'Update Tags',
        description: 'Update the review tags',
        value: {
          tags: ['Updated Tag', 'New Category', 'Better Experience']
        } as UpdateReviewDto
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
    description: 'Review updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '990e8400-e29b-41d4-a716-446655440000' },
        rating: { type: 'number', example: 4 },
        title: { type: 'string', example: 'Updated review title' },
        content: { type: 'string', example: 'Updated review content' },
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
        message: { type: 'array', items: { type: 'string' }, example: ['rating must be a number between 1 and 5'] },
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
    description: 'Forbidden - User can only update their own reviews',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You can only update your own reviews' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Review not found' }
      }
    }
  })
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @Request() req: any) {
    return this.reviewsService.update(id, updateReviewDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(AdminOrUserGuard)
  @ApiOperation({
    summary: 'Delete review',
    description: 'Delete an existing review. Users can only delete their own reviews unless they are administrators.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: '990e8400-e29b-41d4-a716-446655440000'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Review deleted successfully' },
        deletedReviewId: { type: 'string', format: 'uuid', example: '990e8400-e29b-41d4-a716-446655440000' }
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
    description: 'Forbidden - User can only delete their own reviews',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You can only delete your own reviews' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Review not found' }
      }
    }
  })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.reviewsService.remove(id, req.user.id, req.user.role);
  }
}
