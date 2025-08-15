import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { User } from '../users/entities/user.entity';
import { Car } from '../cars/entities/car.entity';
import { History } from '../history/entities/history.entity';
import { Review } from '../reviews/entities/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let adminRepository: Repository<Admin>;
  let userRepository: Repository<User>;
  let carRepository: Repository<Car>;
  let historyRepository: Repository<History>;
  let reviewRepository: Repository<Review>;
  let jwtService: JwtService;

  const mockAdminRepository = {
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
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCarRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockHistoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockReviewRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockAdminRepository,
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
          provide: getRepositoryToken(History),
          useValue: mockHistoryRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    adminRepository = module.get<Repository<Admin>>(getRepositoryToken(Admin));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    carRepository = module.get<Repository<Car>>(getRepositoryToken(Car));
    historyRepository = module.get<Repository<History>>(getRepositoryToken(History));
    reviewRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have all required dependencies', () => {
    expect(adminRepository).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(carRepository).toBeDefined();
    expect(historyRepository).toBeDefined();
    expect(reviewRepository).toBeDefined();
    expect(jwtService).toBeDefined();
  });
});
