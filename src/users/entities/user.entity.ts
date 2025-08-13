import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Car } from '../../cars/entities/car.entity';
import { Review } from '../../reviews/entities/review.entity';
import { History } from '../../history/entities/history.entity';
import { Ranking } from '../../ranking/entities/ranking.entity';

export enum UserRole {
  CUSTOMER = 'customer',
  OWNER = 'owner',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  VERIFIED = 'verified'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 20, unique: true })
  phoneNumber: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 50, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  postalCode: string;

  @Column({ length: 50, nullable: true })
  country: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'text', nullable: true })
  profilePicture: string;

  @Column({ type: 'text', nullable: true })
  driverLicenseNumber: string;

  @Column({ type: 'date', nullable: true })
  driverLicenseExpiry: Date;

  @Column({ type: 'text', nullable: true })
  businessName: string;

  @Column({ type: 'text', nullable: true })
  businessLicense: string;

  @Column({ type: 'text', nullable: true })
  insuranceProvider: string;

  @Column({ type: 'text', nullable: true })
  insurancePolicyNumber: string;

  @Column({ type: 'text', nullable: true })
  emergencyContactName: string;

  @Column({ type: 'text', nullable: true })
  emergencyContactPhone: string;

  @Column({ type: 'text', nullable: true })
  emergencyContactRelationship: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    preferredCarTypes?: string[];
    preferredFuelTypes?: string[];
    preferredTransmission?: string;
    maxDailyRate?: number;
    preferredPickupLocation?: string;
  };

  @Column({ length: 10, nullable: true, default: 'en' })
  preferredLanguage: string;

  @Column({ length: 50, nullable: true, default: 'UTC' })
  timezone: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ type: 'text', nullable: true })
  preferredPaymentMethod: string;

  @Column({ type: 'simple-array', nullable: true })
  notificationPreferences: string[];

  @Column({ type: 'boolean', default: false })
  marketingConsent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  termsAcceptedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  privacyAcceptedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  totalRentals: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Car, car => car.owner)
  ownedCars: Car[];

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToMany(() => History, history => history.user)
  rentalHistory: History[];

  @OneToMany(() => Ranking, ranking => ranking.user)
  rankings: Ranking[];
}
