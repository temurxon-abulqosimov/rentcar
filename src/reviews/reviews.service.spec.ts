import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { Car } from '../cars/entities/car.entity';
import { User } from '../users/entities/user.entity';
import { History } from '../history/entities/history.entity';
import { CarsService } from '../cars/cars.service';
import { UsersService } from '../users/users.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepository: Repository<Review>;
  let carRepository: Repository<Car>;
  let userRepository: Repository<User>;
  let historyRepository: Repository<History>;
  let carsService: CarsService;
  let usersService: UsersService;

  const mockReviewRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCarRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockHistoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCarsService = {
    updateRating: jest.fn(),
  };

  const mockUsersService = {
    updateRating: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(Car),
          useValue: mockCarRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(History),
          useValue: mockHistoryRepository,
        },
        {
          provide: CarsService,
          useValue: mockCarsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
    carRepository = module.get<Repository<Car>>(getRepositoryToken(Car));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    historyRepository = module.get<Repository<History>>(getRepositoryToken(History));
    carsService = module.get<CarsService>(CarsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have all required dependencies', () => {
    expect(reviewRepository).toBeDefined();
    expect(carRepository).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(historyRepository).toBeDefined();
    expect(carsService).toBeDefined();
    expect(usersService).toBeDefined();
  });
});
