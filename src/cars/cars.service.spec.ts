import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarsService } from './cars.service';
import { Car } from './entities/car.entity';
import { User } from '../users/entities/user.entity';

describe('CarsService', () => {
  let service: CarsService;
  let carRepository: Repository<Car>;
  let userRepository: Repository<User>;

  const mockCarRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsService,
        {
          provide: getRepositoryToken(Car),
          useValue: mockCarRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<CarsService>(CarsService);
    carRepository = module.get<Repository<Car>>(getRepositoryToken(Car));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have all required dependencies', () => {
    expect(carRepository).toBeDefined();
    expect(userRepository).toBeDefined();
  });
});
