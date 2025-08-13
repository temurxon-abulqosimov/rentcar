import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';
import { Ranking } from './entities/ranking.entity';
import { User } from '../users/entities/user.entity';
import { Car } from '../cars/entities/car.entity';
import { Review } from '../reviews/entities/review.entity';
import { History } from '../history/entities/history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ranking, User, Car, Review, History]),
  ],
  controllers: [RankingController],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
