import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Car } from '../cars/entities/car.entity';
import { History } from '../history/entities/history.entity';
import { Review } from '../reviews/entities/review.entity';
import { Ranking } from '../ranking/entities/ranking.entity';
import { Admin } from '../admin/entities/admin.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isDevelopment = configService.get('NODE_ENV') === 'development' || 
                       configService.get('NODE_ENV') === undefined || 
                       process.env.NODE_ENV === 'development' || 
                       process.env.NODE_ENV === undefined;
  
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'admin'),
    database: configService.get('DB_NAME', 'rentcar'),
    entities: [User, Car, History, Review, Ranking, Admin],
    synchronize: true, // Will be true for development
    logging: isDevelopment,
    ssl: configService.get('SSL_ENABLED', 'false') === 'true' ? { rejectUnauthorized: false } : false,
    migrations: ['dist/migrations/*.js'],
    migrationsRun: true,
    autoLoadEntities: true,
  };
};

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'rentcar',
  entities: [User, Car, History, Review, Ranking, Admin],
  synchronize: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined,
  logging: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined,
      ssl: process.env.SSL_ENABLED === 'true' ? { rejectUnauthorized: false } : false,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
  autoLoadEntities: true,
}; 