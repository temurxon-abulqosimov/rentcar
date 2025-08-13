import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Car } from '../cars/entities/car.entity';
import { User } from '../users/entities/user.entity';
import { History, RentalStatus } from '../history/entities/history.entity';
import { CarsService } from '../cars/cars.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
    private readonly carsService: CarsService,
    private readonly usersService: UsersService,
  ) {}

  async create(createReviewDto: any, userId: string): Promise<Review> {
    const { carId, rating, comment } = createReviewDto;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if car exists
    const car = await this.carRepository.findOne({
      where: { id: carId },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    // Check if user has rented this car and completed the rental
    const rental = await this.historyRepository.findOne({
      where: {
        userId,
        carId,
        status: RentalStatus.COMPLETED,
      },
    });

    if (!rental) {
      throw new BadRequestException('You can only review cars you have rented and completed');
    }

    // Check if user has already reviewed this car
    const existingReview = await this.reviewRepository.findOne({
      where: {
        userId,
        carId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this car');
    }

    // Create review
    const review = this.reviewRepository.create({
      userId,
      carId,
      rating,
      comment,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update car rating
    await this.carsService.updateRating(carId, rating);

    // Update user rating (as a car owner)
    if (car.ownerId !== userId) {
      await this.usersService.updateRating(car.ownerId, rating);
    }

    return savedReview;
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find({
      relations: ['user', 'car'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'car'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async findByCar(carId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { carId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { userId },
      relations: ['car'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateReviewDto: any, userId: string, userRole: string): Promise<Review> {
    const review = await this.findOne(id);

    // Check if user can update this review
    if (review.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Validate rating if it's being updated
    if (updateReviewDto.rating && (updateReviewDto.rating < 1 || updateReviewDto.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // If rating is being updated, we need to recalculate car and user ratings
    if (updateReviewDto.rating && updateReviewDto.rating !== review.rating) {
      const oldRating = review.rating;
      const newRating = updateReviewDto.rating;

      // Update car rating
      await this.updateCarRating(review.carId, oldRating, newRating);

      // Update user rating if different user
      if (review.car.ownerId !== userId) {
        await this.updateUserRating(review.car.ownerId, oldRating, newRating);
      }
    }

    await this.reviewRepository.update(id, updateReviewDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const review = await this.findOne(id);

    // Check if user can delete this review
    if (review.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Update car rating before deleting
    await this.updateCarRating(review.carId, review.rating, 0, true);

    // Update user rating if different user
    if (review.car.ownerId !== userId) {
      await this.updateUserRating(review.car.ownerId, review.rating, 0, true);
    }

    await this.reviewRepository.remove(review);
  }

  async getCarRatingStats(carId: string): Promise<any> {
    const stats = await this.reviewRepository
      .createQueryBuilder('review')
      .where('review.carId = :carId', { carId })
      .select([
        'COUNT(*) as totalReviews',
        'AVG(review.rating) as averageRating',
        'SUM(CASE WHEN review.rating = 5 THEN 1 ELSE 0 END) as fiveStar',
        'SUM(CASE WHEN review.rating = 4 THEN 1 ELSE 0 END) as fourStar',
        'SUM(CASE WHEN review.rating = 3 THEN 1 ELSE 0 END) as threeStar',
        'SUM(CASE WHEN review.rating = 2 THEN 1 ELSE 0 END) as twoStar',
        'SUM(CASE WHEN review.rating = 1 THEN 1 ELSE 0 END) as oneStar',
      ])
      .getRawOne();

    return stats;
  }

  async getUserRatingStats(userId: string): Promise<any> {
    const stats = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.car', 'car')
      .where('car.ownerId = :userId', { userId })
      .select([
        'COUNT(*) as totalReviews',
        'AVG(review.rating) as averageRating',
        'SUM(CASE WHEN review.rating = 5 THEN 1 ELSE 0 END) as fiveStar',
        'SUM(CASE WHEN review.rating = 4 THEN 1 ELSE 0 END) as fourStar',
        'SUM(CASE WHEN review.rating = 3 THEN 1 ELSE 0 END) as threeStar',
        'SUM(CASE WHEN review.rating = 2 THEN 1 ELSE 0 END) as twoStar',
        'SUM(CASE WHEN review.rating = 1 THEN 1 ELSE 0 END) as oneStar',
      ])
      .getRawOne();

    return stats;
  }

  private async updateCarRating(carId: string, oldRating: number, newRating: number, isDeleting: boolean = false): Promise<void> {
    const car = await this.carRepository.findOne({
      where: { id: carId },
    });

    if (!car) return;

    let newAverageRating: number;

    if (isDeleting) {
      // Removing a review
      if (car.totalRentals === 1) {
        newAverageRating = 0;
      } else {
        const currentTotal = car.rating * car.totalRentals;
        newAverageRating = (currentTotal - oldRating) / (car.totalRentals - 1);
      }
    } else {
      // Updating a review
      const currentTotal = car.rating * car.totalRentals;
      newAverageRating = (currentTotal - oldRating + newRating) / car.totalRentals;
    }

    await this.carRepository.update(carId, {
      rating: Math.max(0, newAverageRating),
    });
  }

  private async updateUserRating(userId: string, oldRating: number, newRating: number, isDeleting: boolean = false): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) return;

    let newAverageRating: number;

    if (isDeleting) {
      // Removing a review
      if (user.totalRentals === 1) {
        newAverageRating = 0;
      } else {
        const currentTotal = user.rating * user.totalRentals;
        newAverageRating = (currentTotal - oldRating) / (user.totalRentals - 1);
      }
    } else {
      // Updating a review
      const currentTotal = user.rating * user.totalRentals;
      newAverageRating = (currentTotal - oldRating + newRating) / user.totalRentals;
    }

    await this.userRepository.update(userId, {
      rating: Math.max(0, newAverageRating),
    });
  }
}
