import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RankingType {
  RENTAL_COUNT = 'rental_count',
  TOTAL_SPENT = 'total_spent',
  REVIEW_COUNT = 'review_count',
  RATING_SCORE = 'rating_score',
  REFERRAL_COUNT = 'referral_count',
  LOYALTY_POINTS = 'loyalty_points',
  EARNINGS = 'earnings'
}

export enum AchievementType {
  FIRST_RENTAL = 'first_rental',
  FREQUENT_RENTER = 'frequent_renter',
  HIGH_SPENDER = 'high_spender',
  REVIEWER = 'reviewer',
  TOP_RATED = 'top_rated',
  LOYAL_CUSTOMER = 'loyal_customer',
  REFERRAL_MASTER = 'referral_master',
  SAFE_DRIVER = 'safe_driver',
  EARLY_BIRD = 'early_bird',
  WEEKEND_WARRIOR = 'weekend_warrior'
}

export enum TierLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

@Entity('rankings')
export class Ranking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RankingType })
  type: RankingType;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'int', default: 0 })
  rank: number;

  @Column({ type: 'int', default: 0 })
  previousRank: number;

  @Column({ type: 'int', default: 0 })
  rankChange: number;

  @Column({ type: 'enum', enum: TierLevel, default: TierLevel.BRONZE })
  tier: TierLevel;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 0 })
  totalPoints: number;

  @Column({ type: 'int', default: 0 })
  pointsToNextTier: number;

  @Column({ type: 'text', array: true, default: [] })
  achievements: AchievementType[];

  @Column({ type: 'jsonb', nullable: true })
  statistics: {
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

  @Column({ type: 'text', array: true, default: [] })
  badges: string[];

  @Column({ type: 'text', nullable: true })
  specialTitle: string;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastActivity: Date;

  @Column({ type: 'int', default: 0 })
  streakDays: number;

  @Column({ type: 'timestamp', nullable: true })
  streakStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastStreakDate: Date;

  @Column({ type: 'text', array: true, default: [] })
  monthlyGoals: string[];

  @Column({ type: 'boolean', default: false })
  monthlyGoalCompleted: boolean;

  @Column({ type: 'int', default: 0 })
  monthlyGoalProgress: number;

  @Column({ type: 'text', nullable: true })
  motivationMessage: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.rankings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;
}
