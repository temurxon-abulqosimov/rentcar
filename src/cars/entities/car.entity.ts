import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { History } from '../../history/entities/history.entity';
import { Review } from '../../reviews/entities/review.entity';

export enum CarType {
  SEDAN = 'sedan',
  SUV = 'suv',
  HATCHBACK = 'hatchback',
  COUPE = 'coupe',
  CONVERTIBLE = 'convertible',
  WAGON = 'wagon',
  PICKUP = 'pickup',
  VAN = 'van',
  TRUCK = 'truck',
  MOTORCYCLE = 'motorcycle'
}

export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  PLUGIN_HYBRID = 'plugin_hybrid',
  HYDROGEN = 'hydrogen'
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  CVT = 'cvt',
  SEMI_AUTOMATIC = 'semi_automatic'
}

export enum CarStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
  RESERVED = 'reserved'
}

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  brand: string;

  @Column({ length: 100 })
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'enum', enum: CarType })
  type: CarType;

  @Column({ type: 'enum', enum: FuelType })
  fuelType: FuelType;

  @Column({ type: 'enum', enum: TransmissionType })
  transmission: TransmissionType;

  @Column({ type: 'int' })
  engineSize: number;

  @Column({ type: 'int' })
  horsepower: number;

  @Column({ type: 'int' })
  mileage: number;

  @Column({ type: 'int' })
  seats: number;

  @Column({ type: 'int' })
  doors: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  dailyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weeklyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deposit: number;

  @Column({ type: 'enum', enum: CarStatus, default: CarStatus.AVAILABLE })
  status: CarStatus;

  @Column({ type: 'text', array: true, default: [] })
  features: string[];

  @Column({ type: 'text', array: true, default: [] })
  images: string[];

  @Column({ type: 'text', nullable: true })
  licensePlate: string;

  @Column({ type: 'text', nullable: true })
  vin: string;

  @Column({ type: 'text', nullable: true })
  insurance: string;

  @Column({ type: 'date', nullable: true })
  insuranceExpiry: Date;

  @Column({ type: 'date', nullable: true })
  registrationExpiry: Date;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  totalRentals: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ type: 'boolean', default: false })
  isAvailable: boolean;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.ownedCars)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ type: 'uuid' })
  ownerId: string;

  @OneToMany(() => History, history => history.car)
  rentalHistory: History[];

  @OneToMany(() => Review, review => review.car)
  reviews: Review[];
}
