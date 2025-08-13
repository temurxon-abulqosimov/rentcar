import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Car } from '../../cars/entities/car.entity';

export enum RentalStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXTENDED = 'extended',
  OVERDUE = 'overdue'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@Entity('rental_history')
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualReturnDate: Date;

  @Column({ type: 'int' })
  duration: number; // in days

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  dailyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deposit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  depositReturned: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lateFees: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  damageFees: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fuelFees: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cleaningFees: number;

  @Column({ type: 'enum', enum: RentalStatus, default: RentalStatus.PENDING })
  status: RentalStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  pickupLocation: string;

  @Column({ type: 'text', nullable: true })
  returnLocation: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  pickupLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  pickupLongitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  returnLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  returnLongitude: number;

  @Column({ type: 'int', default: 0 })
  initialMileage: number;

  @Column({ type: 'int', default: 0 })
  finalMileage: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'text', nullable: true })
  damageDescription: string;

  @Column({ type: 'text', array: true, default: [] })
  damagePhotos: string[];

  @Column({ type: 'text', nullable: true })
  insuranceClaim: string;

  @Column({ type: 'boolean', default: false })
  isExtended: boolean;

  @Column({ type: 'int', default: 0 })
  extensionDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  extensionCost: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.rentalHistory)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Car, car => car.rentalHistory)
  @JoinColumn({ name: 'carId' })
  car: Car;

  @Column({ type: 'uuid' })
  carId: string;
}
