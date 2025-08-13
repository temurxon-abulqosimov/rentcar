import { IsString, IsEmail, IsPhoneNumber, IsEnum, IsOptional, IsBoolean, IsArray, Length, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminRole, AdminStatus, AdminPermission } from '../entities/admin.entity';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Admin\'s first name',
    example: 'Admin',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({
    description: 'Admin\'s last name',
    example: 'User',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  lastName: string;

  @ApiProperty({
    description: 'Admin\'s email address (must be unique)',
    example: 'admin@carrental.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Admin\'s phone number (must be unique)',
    example: '+1234567890',
    format: 'phone',
  })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    description: 'Admin\'s password (minimum 8 characters)',
    example: 'adminPassword123',
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @Length(8, 255)
  password: string;

  @ApiPropertyOptional({
    description: 'Admin\'s role in the system',
    enum: AdminRole,
    example: AdminRole.ADMIN,
    default: AdminRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @ApiPropertyOptional({
    description: 'Admin\'s account status',
    enum: AdminStatus,
    example: AdminStatus.ACTIVE,
    default: AdminStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AdminStatus)
  status?: AdminStatus;

  @ApiPropertyOptional({
    description: 'Admin\'s permissions in the system',
    enum: AdminPermission,
    example: [AdminPermission.USER_MANAGEMENT, AdminPermission.CAR_MANAGEMENT],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  permissions?: AdminPermission[];

  @ApiPropertyOptional({
    description: 'Admin\'s profile picture URL',
    example: 'https://example.com/admin-profile.jpg',
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional({
    description: 'Admin\'s employee ID',
    example: 'EMP001',
  })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Admin\'s hire date',
    example: '2024-01-01',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({
    description: 'Admin\'s department',
    example: 'Operations',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Admin\'s supervisor',
    example: 'Manager Name',
  })
  @IsOptional()
  @IsString()
  supervisor?: string;

  @ApiPropertyOptional({
    description: 'Admin\'s assigned regions',
    example: ['North', 'South', 'East'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedRegions?: string[];

  @ApiPropertyOptional({
    description: 'Admin\'s total actions performed',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalActions?: number;

  @ApiPropertyOptional({
    description: 'Admin\'s successful actions count',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  successfulActions?: number;

  @ApiPropertyOptional({
    description: 'Admin\'s failed actions count',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  failedActions?: number;

  @ApiPropertyOptional({
    description: 'Admin\'s last login IP address',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  lastLoginIp?: string;

  @ApiPropertyOptional({
    description: 'Admin\'s last login location',
    example: 'New York, USA',
  })
  @IsOptional()
  @IsString()
  lastLoginLocation?: string;

  @ApiPropertyOptional({
    description: 'Whether admin is currently online',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiPropertyOptional({
    description: 'Admin\'s notes',
    example: 'Experienced admin with 5 years of experience',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether admin requires password change',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresPasswordChange?: boolean;

  @ApiPropertyOptional({
    description: 'Whether admin has two-factor authentication enabled',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;
}
