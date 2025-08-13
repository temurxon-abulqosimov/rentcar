import { IsString, IsNumber, IsEnum, IsOptional, IsArray, Min, Max, Length, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Car ID being reviewed',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  carId: string;

  @ApiProperty({
    description: 'Rental history ID (if reviewing a rental experience)',
    example: '660e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  historyId: string;

  @ApiProperty({
    description: 'Overall rating (1-5 stars)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Review title/headline',
    example: 'Excellent car rental experience!',
    minLength: 5,
    maxLength: 100,
  })
  @IsString()
  @Length(5, 100)
  title: string;

  @ApiProperty({
    description: 'Detailed review content',
    example: 'The car was in perfect condition and the rental process was smooth. Highly recommend!',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @Length(10, 1000)
  content: string;

  @ApiPropertyOptional({
    description: 'Cleanliness rating (1-5 stars)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  cleanlinessRating?: number;

  @ApiPropertyOptional({
    description: 'Comfort rating (1-5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  comfortRating?: number;

  @ApiPropertyOptional({
    description: 'Performance rating (1-5 stars)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  performanceRating?: number;

  @ApiPropertyOptional({
    description: 'Value for money rating (1-5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  valueRating?: number;

  @ApiPropertyOptional({
    description: 'Customer service rating (1-5 stars)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  customerServiceRating?: number;

  @ApiPropertyOptional({
    description: 'Review tags/categories',
    example: ['Great Experience', 'Clean Car', 'Good Value'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Photos/images related to the review',
    example: ['https://example.com/review1.jpg', 'https://example.com/review2.jpg'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({
    description: 'Whether the review is anonymous',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsString()
  anonymous?: string;

  @ApiPropertyOptional({
    description: 'Whether the review is verified (from actual rental)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsString()
  verified?: string;

  @ApiPropertyOptional({
    description: 'Review helpfulness count',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  helpfulCount?: number;

  @ApiPropertyOptional({
    description: 'Review helpfulness count (negative)',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unhelpfulCount?: number;

  @ApiPropertyOptional({
    description: 'Whether the review has been responded to by owner/admin',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsString()
  hasResponse?: string;

  @ApiPropertyOptional({
    description: 'Review status',
    example: 'published',
    default: 'published',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Additional comments about the car features',
    example: 'The GPS navigation was very helpful for city driving',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @Length(0, 300)
  featureComments?: string;

  @ApiPropertyOptional({
    description: 'Comments about the rental process',
    example: 'Pickup and drop-off were very convenient',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @Length(0, 300)
  processComments?: string;

  @ApiPropertyOptional({
    description: 'Comments about the car condition',
    example: 'Car was spotless and well-maintained',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @Length(0, 300)
  conditionComments?: string;

  @ApiPropertyOptional({
    description: 'Recommendation level (1-10)',
    example: 10,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  recommendationLevel?: number;

  @ApiPropertyOptional({
    description: 'Whether the user would rent this car again',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsString()
  wouldRentAgain?: string;

  @ApiPropertyOptional({
    description: 'Whether the user would recommend to friends',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsString()
  wouldRecommend?: string;

  @ApiPropertyOptional({
    description: 'Review language',
    example: 'en',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Review source (web, mobile app, etc.)',
    example: 'web',
    default: 'web',
  })
  @IsOptional()
  @IsString()
  source?: string;
}
