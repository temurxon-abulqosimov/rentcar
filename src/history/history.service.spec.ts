import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryService } from './history.service';
import { History } from './entities/history.entity';
import { Car } from '../cars/entities/car.entity';
import { User } from '../users/entities/user.entity';
import { CarsService } from '../cars/cars.service';
import { UsersService } from '../users/users.service';

describe('HistoryService', () => {
  let service: HistoryService;
  let historyRepository: Repository<History>;
  let carRepository: Repository<Car>;
  let userRepository: Repository<User>;
  let carsService: CarsService;
  let usersService: UsersService;

  const mockHistoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCarRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockCarsService = {
    updateStatus: jest.fn(),
    updateEarnings: jest.fn(),
  };

  const mockUsersService = {
    updateTotalSpent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: getRepositoryToken(History),
          useValue: mockHistoryRepository,
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
          provide: CarsService,
          useValue: mockCarsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    historyRepository = module.get<Repository<History>>(getRepositoryToken(History));
    carRepository = module.get<Repository<Car>>(getRepositoryToken(Car));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    carsService = module.get<CarsService>(CarsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have all required dependencies', () => {
    expect(historyRepository).toBeDefined();
    expect(carRepository).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(carsService).toBeDefined();
    expect(usersService).toBeDefined();
  });
});
