import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min, Max, IsUUID, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RankingType, AchievementType, TierLevel } from '../entities/ranking.entity';

export class CreateRankingDto {
  @ApiProperty({
    description: 'Type of ranking',
    enum: RankingType,
    example: RankingType.RENTAL_COUNT,
  })
  @IsEnum(RankingType)
  type: RankingType;

  @ApiProperty({
    description: 'Ranking score (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiPropertyOptional({
    description: 'Ranking position (1 being the best)',
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rank?: number;

  @ApiPropertyOptional({
    description: 'Previous ranking position',
    example: 8,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  previousRank?: number;

  @ApiPropertyOptional({
    description: 'Ranking change',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  rankChange?: number;

  @ApiPropertyOptional({
    description: 'User tier level',
    enum: TierLevel,
    example: TierLevel.GOLD,
  })
  @IsOptional()
  @IsEnum(TierLevel)
  tier?: TierLevel;

  @ApiPropertyOptional({
    description: 'Current points',
    example: 250,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({
    description: 'Total accumulated points',
    example: 500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPoints?: number;

  @ApiPropertyOptional({
    description: 'Points needed for next tier',
    example: 250,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsToNextTier?: number;

  @ApiPropertyOptional({
    description: 'User achievements',
    enum: AchievementType,
    isArray: true,
    example: [AchievementType.FIRST_RENTAL, AchievementType.REVIEWER],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AchievementType, { each: true })
  achievements?: AchievementType[];

  @ApiPropertyOptional({
    description: 'User statistics',
    example: {
      totalRentals: 15,
      totalSpent: 1200.50,
      averageRating: 4.8,
      reviewCount: 12,
      referralCount: 3,
      loyaltyPoints: 150,
      consecutiveRentals: 5,
      longestRental: 7,
      favoriteCarType: 'SUV',
      preferredLocation: 'Downtown'
    }
  })
  @IsOptional()
  statistics?: {
    totalRentals: number;
    totalSpent: number;
    averageRating: number;
    reviewCount: number;
    referralCount: number;
    loyaltyPoints: number;
    consecutiveRentals: number;
    longestRental: number;
    favoriteCarType: string;
    preferredLocation: string;
  };

  @ApiPropertyOptional({
    description: 'User badges',
    example: ['Top Renter', 'Verified User', 'Early Bird'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  badges?: string[];

  @ApiPropertyOptional({
    description: 'Special title',
    example: 'Car Enthusiast',
  })
  @IsOptional()
  @IsString()
  specialTitle?: string;

  @ApiPropertyOptional({
    description: 'Whether user is featured',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Last activity date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  lastActivity?: string;

  @ApiPropertyOptional({
    description: 'Current streak days',
    example: 7,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  streakDays?: number;

  @ApiPropertyOptional({
    description: 'Streak start date',
    example: '2024-01-08T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  streakStartDate?: string;

  @ApiPropertyOptional({
    description: 'Last streak date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  lastStreakDate?: string;

  @ApiPropertyOptional({
    description: 'Monthly goals',
    example: ['Rent 5 cars', 'Write 3 reviews'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  monthlyGoals?: string[];

  @ApiPropertyOptional({
    description: 'Whether monthly goal is completed',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  monthlyGoalCompleted?: boolean;

  @ApiPropertyOptional({
    description: 'Monthly goal progress percentage',
    example: 60,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  monthlyGoalProgress?: number;

  @ApiPropertyOptional({
    description: 'Motivation message',
    example: 'Keep up the great work!',
  })
  @IsOptional()
  @IsString()
  motivationMessage?: string;

  @ApiPropertyOptional({
    description: 'Whether ranking is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  userId: string;
}
