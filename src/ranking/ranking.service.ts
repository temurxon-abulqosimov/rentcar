import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import { Ranking, RankingType, AchievementType, TierLevel } from './entities/ranking.entity';
import { User, UserStatus } from '../users/entities/user.entity';
import { Car, CarStatus } from '../cars/entities/car.entity';
import { Review } from '../reviews/entities/review.entity';
import { History, RentalStatus } from '../history/entities/history.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(Ranking)
    private readonly rankingRepository: Repository<Ranking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {}

  async create(createRankingDto: CreateRankingDto): Promise<Ranking> {
    const ranking = this.rankingRepository.create(createRankingDto);
    return await this.rankingRepository.save(ranking);
  }

  async findAll(): Promise<Ranking[]> {
    return await this.rankingRepository.find({
      relations: ['user'],
      order: { score: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Ranking> {
    const ranking = await this.rankingRepository.findOne({
      where: { id },
      relations: ['user']
    });
    
    if (!ranking) {
      throw new NotFoundException(`Ranking with ID ${id} not found`);
    }
    
    return ranking;
  }

  async getTopRankings(entityType: string, category: string, limit: number = 10): Promise<Ranking[]> {
    return await this.rankingRepository.find({
      where: { 
        type: entityType as RankingType,
        isActive: true 
      },
      relations: ['user'],
      order: { score: 'DESC', rank: 'ASC' },
      take: limit
    });
  }

  async update(id: string, updateRankingDto: UpdateRankingDto, userId: string, userRole: string): Promise<Ranking> {
    const ranking = await this.findOne(id);
    
    // Check permissions
    if (userRole !== 'admin' && userRole !== 'superadmin' && ranking.userId !== userId) {
      throw new BadRequestException('Insufficient permissions to update this ranking');
    }
    
    Object.assign(ranking, updateRankingDto);
    return await this.rankingRepository.save(ranking);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const ranking = await this.findOne(id);
    
    // Check permissions
    if (userRole !== 'admin' && userRole !== 'superadmin' && ranking.userId !== userId) {
      throw new BadRequestException('Insufficient permissions to delete this ranking');
    }
    
    await this.rankingRepository.remove(ranking);
  }

  // Core ranking calculation methods
  async calculateUserRankings(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    // Get user statistics
    const stats = await this.getUserStatistics(userId);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(stats);
    
    // Determine tier
    const tier = this.calculateTier(overallScore);
    
    // Calculate points
    const points = this.calculatePoints(stats);
    const totalPoints = stats.loyaltyPoints;
    const pointsToNextTier = this.calculatePointsToNextTier(tier, totalPoints);
    
    // Get achievements
    const achievements = await this.checkAchievements(stats);
    
    // Update or create ranking
    await this.updateUserRanking(userId, {
      type: RankingType.RENTAL_COUNT,
      score: overallScore,
      tier,
      points,
      totalPoints,
      pointsToNextTier,
      achievements,
      statistics: stats,
      lastActivity: new Date()
    });
  }

  async calculateCarRankings(carId: string): Promise<void> {
    const car = await this.carRepository.findOne({ where: { id: carId } });
    if (!car) return;

    // Get car statistics
    const stats = await this.getCarStatistics(carId);
    
    // Calculate score based on reviews and rental success
    const score = this.calculateCarScore(stats);
    
    // Update car ranking
    await this.updateCarRanking(carId, {
      type: RankingType.RATING_SCORE,
      score,
      statistics: stats
    });
  }

  async calculateOwnerRankings(ownerId: string): Promise<void> {
    // Get owner statistics (cars, earnings, customer satisfaction)
    const stats = await this.getOwnerStatistics(ownerId);
    
    // Calculate owner score
    const score = this.calculateOwnerScore(stats);
    
    // Update owner ranking
    await this.updateOwnerRanking(ownerId, {
      type: RankingType.EARNINGS,
      score,
      statistics: stats
    });
  }

  // Helper methods for statistics
  private async getUserStatistics(userId: string) {
    const [rentals, reviews, totalSpent] = await Promise.all([
      this.historyRepository.count({ where: { userId, status: RentalStatus.COMPLETED } }),
      this.reviewRepository.count({ where: { userId } }),
      this.historyRepository
        .createQueryBuilder('history')
        .select('SUM(history.totalCost)', 'total')
        .where('history.userId = :userId AND history.status = :status', { 
          userId, 
          status: RentalStatus.COMPLETED 
        })
        .getRawOne()
    ]);

    const avgRating = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.userId = :userId', { userId })
      .getRawOne();

    return {
      totalRentals: rentals || 0,
      totalSpent: parseFloat(totalSpent?.total || '0'),
      averageRating: parseFloat(avgRating?.average || '0'),
      reviewCount: reviews || 0,
      referralCount: 0, // TODO: Implement referral system
      loyaltyPoints: (rentals || 0) * 10, // Basic loyalty calculation
      consecutiveRentals: 0, // TODO: Implement streak calculation
      longestRental: 0, // TODO: Implement rental duration calculation
      favoriteCarType: '', // TODO: Implement car type preference
      preferredLocation: '' // TODO: Implement location preference
    };
  }

  private async getCarStatistics(carId: string) {
    const [reviews, rentals] = await Promise.all([
      this.reviewRepository.find({ where: { carId } }),
      this.historyRepository.count({ where: { carId, status: RentalStatus.COMPLETED } })
    ]);

    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    return {
      totalRentals: rentals,
      averageRating: avgRating,
      reviewCount: reviews.length,
      totalSpent: 0, // TODO: Calculate from rental history
      referralCount: 0,
      loyaltyPoints: 0,
      consecutiveRentals: 0,
      longestRental: 0,
      favoriteCarType: '',
      preferredLocation: ''
    };
  }

  private async getOwnerStatistics(ownerId: string) {
    // Get all cars owned by this user
    const cars = await this.carRepository.find({ where: { ownerId } });
    const carIds = cars.map(car => car.id);

    const [totalEarnings, totalCars, avgCarRating] = await Promise.all([
      this.historyRepository
        .createQueryBuilder('history')
        .select('SUM(history.totalCost)', 'total')
        .where('history.carId IN (:...carIds) AND history.status = :status', { 
          carIds, 
          status: RentalStatus.COMPLETED 
        })
        .getRawOne(),
      cars.length,
      this.reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'average')
        .where('review.carId IN (:...carIds)', { carIds })
        .getRawOne()
    ]);

    return {
      totalRentals: 0, // TODO: Calculate total rentals across all cars
      totalSpent: parseFloat(totalEarnings?.total || '0'),
      averageRating: parseFloat(avgCarRating?.average || '0'),
      reviewCount: 0, // TODO: Calculate total reviews across all cars
      referralCount: 0,
      loyaltyPoints: 0,
      consecutiveRentals: 0,
      longestRental: 0,
      favoriteCarType: '',
      preferredLocation: '',
      totalCars,
      totalEarnings: parseFloat(totalEarnings?.total || '0')
    };
  }

  // Scoring algorithms
  private calculateOverallScore(stats: any): number {
    let score = 0;
    
    // Rental count weight: 30%
    score += Math.min(stats.totalRentals * 2, 30);
    
    // Spending weight: 25%
    score += Math.min(stats.totalSpent / 100, 25);
    
    // Rating weight: 25%
    score += (stats.averageRating / 5) * 25;
    
    // Review count weight: 20%
    score += Math.min(stats.reviewCount * 2, 20);
    
    return Math.round(score);
  }

  private calculateCarScore(stats: any): number {
    let score = 0;
    
    // Rating weight: 50%
    score += (stats.averageRating / 5) * 50;
    
    // Rental success weight: 30%
    score += Math.min(stats.totalRentals * 3, 30);
    
    // Review count weight: 20%
    score += Math.min(stats.reviewCount * 2, 20);
    
    return Math.round(score);
  }

  private calculateOwnerScore(stats: any): number {
    let score = 0;
    
    // Earnings weight: 40%
    score += Math.min(stats.totalEarnings / 1000, 40);
    
    // Car count weight: 20%
    score += Math.min(stats.totalCars * 5, 20);
    
    // Average rating weight: 30%
    score += (stats.averageRating / 5) * 30;
    
    // Activity weight: 10%
    score += Math.min(stats.totalRentals * 0.5, 10);
    
    return Math.round(score);
  }

  // Tier calculation
  private calculateTier(score: number): TierLevel {
    if (score >= 90) return TierLevel.DIAMOND;
    if (score >= 80) return TierLevel.PLATINUM;
    if (score >= 70) return TierLevel.GOLD;
    if (score >= 60) return TierLevel.SILVER;
    return TierLevel.BRONZE;
  }

  private calculatePoints(stats: any): number {
    return stats.totalRentals * 10 + Math.floor(stats.averageRating * 2) + stats.reviewCount * 5;
  }

  private calculatePointsToNextTier(currentTier: TierLevel, currentPoints: number): number {
    const tierThresholds = {
      [TierLevel.BRONZE]: 100,
      [TierLevel.SILVER]: 250,
      [TierLevel.GOLD]: 500,
      [TierLevel.PLATINUM]: 1000,
      [TierLevel.DIAMOND]: 2000
    };

    const nextTier = this.getNextTier(currentTier);
    if (!nextTier) return 0;

    const threshold = tierThresholds[nextTier];
    return Math.max(0, threshold - currentPoints);
  }

  private getNextTier(currentTier: TierLevel): TierLevel | null {
    const tiers = [TierLevel.BRONZE, TierLevel.SILVER, TierLevel.GOLD, TierLevel.PLATINUM, TierLevel.DIAMOND];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }

  // Achievement checking
  private async checkAchievements(stats: any): Promise<AchievementType[]> {
    const achievements: AchievementType[] = [];

    if (stats.totalRentals === 1) achievements.push(AchievementType.FIRST_RENTAL);
    if (stats.totalRentals >= 10) achievements.push(AchievementType.FREQUENT_RENTER);
    if (stats.totalSpent >= 1000) achievements.push(AchievementType.HIGH_SPENDER);
    if (stats.reviewCount >= 5) achievements.push(AchievementType.REVIEWER);
    if (stats.averageRating >= 4.5) achievements.push(AchievementType.TOP_RATED);
    if (stats.loyaltyPoints >= 500) achievements.push(AchievementType.LOYAL_CUSTOMER);

    return achievements;
  }

  // Update methods
  private async updateUserRanking(userId: string, data: Partial<Ranking>): Promise<void> {
    let ranking = await this.rankingRepository.findOne({ 
      where: { userId, type: RankingType.RENTAL_COUNT } 
    });

    if (ranking) {
      Object.assign(ranking, data);
      await this.rankingRepository.save(ranking);
    } else {
      const newRanking = this.rankingRepository.create({
        userId,
        type: RankingType.RENTAL_COUNT,
        ...data
      });
      await this.rankingRepository.save(newRanking);
    }
  }

  private async updateCarRanking(carId: string, data: Partial<Ranking>): Promise<void> {
    // For cars, we might want to store rankings differently
    // This is a placeholder for car ranking logic
    console.log(`Updating car ranking for ${carId}:`, data);
  }

  private async updateOwnerRanking(ownerId: string, data: Partial<Ranking>): Promise<void> {
    // For owners, we might want to store rankings differently
    // This is a placeholder for owner ranking logic
    console.log(`Updating owner ranking for ${ownerId}:`, data);
  }

  // Public ranking methods
  async getLeaderboard(category: string = 'overall', limit: number = 20): Promise<Ranking[]> {
    return await this.rankingRepository.find({
      where: { isActive: true },
      relations: ['user'],
      order: { score: 'DESC' },
      take: limit
    });
  }

  async getUserRanking(userId: string): Promise<Ranking | null> {
    return await this.rankingRepository.findOne({
      where: { userId, type: RankingType.RENTAL_COUNT },
      relations: ['user']
    });
  }

  async refreshAllRankings(): Promise<void> {
    // Get all active users
    const users = await this.userRepository.find({ where: { status: UserStatus.ACTIVE } });
    
    // Calculate rankings for each user
    for (const user of users) {
      await this.calculateUserRankings(user.id);
    }
    
    // Get all cars
    const cars = await this.carRepository.find({ where: { status: CarStatus.AVAILABLE } });
    
    // Calculate rankings for each car
    for (const car of cars) {
      await this.calculateCarRankings(car.id);
    }
  }
}
