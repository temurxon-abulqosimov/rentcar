import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support'
}

export enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum AdminPermission {
  USER_MANAGEMENT = 'user_management',
  CAR_MANAGEMENT = 'car_management',
  RENTAL_MANAGEMENT = 'rental_management',
  REVIEW_MODERATION = 'review_moderation',
  PAYMENT_MANAGEMENT = 'payment_management',
  SYSTEM_SETTINGS = 'system_settings',
  ANALYTICS = 'analytics',
  SUPPORT = 'support',
  REPORTING = 'reporting'
}

@Entity('admins')
export class Admin {
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

  @Column({ type: 'enum', enum: AdminRole, default: AdminRole.ADMIN })
  role: AdminRole;

  @Column({ type: 'enum', enum: AdminStatus, default: AdminStatus.ACTIVE })
  status: AdminStatus;

  @Column({ type: 'text', array: true, default: [] })
  permissions: AdminPermission[];

  @Column({ type: 'text', nullable: true })
  profilePicture: string;

  @Column({ type: 'text', nullable: true })
  employeeId: string;

  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Column({ type: 'text', nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  supervisor: string;

  @Column({ type: 'text', array: true, default: [] })
  assignedRegions: string[];

  @Column({ type: 'int', default: 0 })
  totalActions: number;

  @Column({ type: 'int', default: 0 })
  successfulActions: number;

  @Column({ type: 'int', default: 0 })
  failedActions: number;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ type: 'text', nullable: true })
  lastLoginIp: string;

  @Column({ type: 'text', nullable: true })
  lastLoginLocation: string;

  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  @Column({ type: 'text', nullable: true })
  sessionToken: string;

  @Column({ type: 'timestamp', nullable: true })
  sessionExpiry: Date;

  @Column({ type: 'text', array: true, default: [] })
  activityLog: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  requiresPasswordChange: boolean;

  @Column({ type: 'timestamp', nullable: true })
  passwordChangedAt: Date;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  accountLockedUntil: Date;

  @Column({ type: 'text', nullable: true })
  twoFactorSecret: string;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'text', array: true, default: [] })
  backupCodes: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
