import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { HistoryModule } from './history/history.module';
import { RankingModule } from './ranking/ranking.module';
import { getDatabaseConfig } from './config/database.config';
import { AllAuthGuard } from './guard/all.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
      global: true,
    }),
    UsersModule,
    CarsModule,
    ReviewsModule,
    AdminModule,
    HistoryModule,
    RankingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   // provide: APP_GUARD,
    //   // useClass: AllAuthGuard,
    // },
  ],
})
export class AppModule {}
