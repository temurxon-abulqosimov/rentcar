import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Car } from '../../cars/entities/car.entity';

export enum ReviewType {
  CAR_REVIEW = 'car_review',
  USER_REVIEW = 'user_review',
  SERVICE_REVIEW = 'service_review'
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ReviewType, default: ReviewType.CAR_REVIEW })
  type: ReviewType;

  @Column({ type: 'int' })
  rating: number; // 1-5 stars

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'text', array: true, default: [] })
  photos: string[];

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isHelpful: boolean;

  @Column({ type: 'int', default: 0 })
  helpfulCount: number;

  @Column({ type: 'int', default: 0 })
  reportCount: number;

  @Column({ type: 'boolean', default: false })
  isReported: boolean;

  @Column({ type: 'text', nullable: true })
  reportReason: string;

  @Column({ type: 'text', nullable: true })
  adminResponse: string;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date;

  @Column({ type: 'text', nullable: true })
  editReason: string;

  @Column({ type: 'jsonb', nullable: true })
  ratingBreakdown: {
    cleanliness: number;
    comfort: number;
    performance: number;
    value: number;
    safety: number;
  };

  @Column({ type: 'text', nullable: true })
  pros: string;

  @Column({ type: 'text', nullable: true })
  cons: string;

  @Column({ type: 'text', nullable: true })
  recommendation: string;

  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Car, car => car.reviews)
  @JoinColumn({ name: 'carId' })
  car: Car;

  @Column({ type: 'uuid' })
  carId: string;
}
