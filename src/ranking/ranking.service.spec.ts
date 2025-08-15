import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RankingService } from './ranking.service';
import { Ranking } from './entities/ranking.entity';
import { User } from '../users/entities/user.entity';
import { Car } from '../cars/entities/car.entity';
import { Review } from '../reviews/entities/review.entity';
import { History } from '../history/entities/history.entity';

describe('RankingService', () => {
  let service: RankingService;
  let rankingRepository: Repository<Ranking>;
  let userRepository: Repository<User>;
  let carRepository: Repository<Car>;
  let reviewRepository: Repository<Review>;
  let historyRepository: Repository<History>;

  const mockRankingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCarRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockReviewRepository = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        {
          provide: getRepositoryToken(Ranking),
          useValue: mockRankingRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Car),
          useValue: mockCarRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(History),
          useValue: mockHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<RankingService>(RankingService);
    rankingRepository = module.get<Repository<Ranking>>(getRepositoryToken(Ranking));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    carRepository = module.get<Repository<Car>>(getRepositoryToken(Car));
    reviewRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
    historyRepository = module.get<Repository<History>>(getRepositoryToken(History));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have all required dependencies', () => {
    expect(rankingRepository).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(carRepository).toBeDefined();
    expect(reviewRepository).toBeDefined();
    expect(historyRepository).toBeDefined();
  });
});
