import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsArray, Length, IsDateString, IsNumber, Min, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../entities/user.entity';

// Define the preferences interface for validation
class UserPreferencesDto {
  @ApiPropertyOptional({
    description: 'Preferred car types',
    example: ['sedan', 'suv'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCarTypes?: string[];

  @ApiPropertyOptional({
    description: 'Preferred fuel types',
    example: ['gasoline', 'hybrid'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredFuelTypes?: string[];

  @ApiPropertyOptional({
    description: 'Preferred transmission type',
    example: 'automatic',
  })
  @IsOptional()
  @IsString()
  preferredTransmission?: string;

  @ApiPropertyOptional({
    description: 'Maximum daily rate willing to pay',
    example: 100,
    minimum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  maxDailyRate?: number;

  @ApiPropertyOptional({
    description: 'Preferred pickup location',
    example: 'Downtown',
  })
  @IsOptional()
  @IsString()
  preferredPickupLocation?: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'User\'s first name',
    example: 'John',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({
    description: 'User\'s last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  lastName: string;

  @ApiProperty({
    description: 'User\'s email address (must be unique)',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User\'s phone number (must be unique)',
    example: '+1234567890',
    pattern: '^\\+[1-9]\\d{1,14}$',
  })
  @IsString()
  @Length(10, 20)
  phoneNumber: string;

  @ApiProperty({
    description: 'User\'s password (minimum 8 characters)',
    example: 'securePassword123',
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @Length(8, 255)
  password: string;

  @ApiPropertyOptional({
    description: 'User\'s role in the system',
    enum: UserRole,
    example: UserRole.CUSTOMER,
    default: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'User\'s account status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    default: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'User\'s profile picture URL',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional({
    description: 'User\'s date of birth',
    example: '1990-01-01',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'User\'s address',
    example: '123 Main St, City, Country',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'User\'s city',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'User\'s state/province',
    example: 'NY',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'User\'s country',
    example: 'USA',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'User\'s postal code',
    example: '10001',
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'User\'s driver\'s license number',
    example: 'DL123456789',
  })
  @IsOptional()
  @IsString()
  driverLicenseNumber?: string;

  @ApiPropertyOptional({
    description: 'User\'s driver\'s license expiry date',
    example: '2025-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  driverLicenseExpiry?: string;

  @ApiPropertyOptional({
    description: 'User\'s business name (for car owners)',
    example: 'Johnson Car Rentals',
  })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({
    description: 'User\'s business license number',
    example: 'BL789456123',
  })
  @IsOptional()
  @IsString()
  businessLicense?: string;

  @ApiPropertyOptional({
    description: 'User\'s insurance provider',
    example: 'SafeDrive Insurance',
  })
  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @ApiPropertyOptional({
    description: 'User\'s insurance policy number',
    example: 'POL123456789',
  })
  @IsOptional()
  @IsString()
  insurancePolicyNumber?: string;

  @ApiPropertyOptional({
    description: 'User\'s emergency contact name',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional({
    description: 'User\'s emergency contact phone',
    example: '+1234567890',
    pattern: '^\\+[1-9]\\d{1,14}$',
  })
  @IsOptional()
  @IsString()
  @Length(10, 20)
  emergencyContactPhone?: string;

  @ApiPropertyOptional({
    description: 'User\'s emergency contact relationship',
    example: 'Spouse',
  })
  @IsOptional()
  @IsString()
  emergencyContactRelationship?: string;

  @ApiPropertyOptional({
    description: 'User\'s preferences for car rentals',
    type: UserPreferencesDto,
  })
  @IsOptional()
  @IsObject()
  preferences?: UserPreferencesDto;

  @ApiPropertyOptional({
    description: 'User\'s preferred language',
    example: 'en',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiPropertyOptional({
    description: 'User\'s timezone',
    example: 'America/New_York',
    default: 'UTC',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Whether user has verified their email',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Whether user has verified their phone number',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  phoneVerified?: boolean;

  @ApiPropertyOptional({
    description: 'User\'s preferred payment method',
    example: 'credit_card',
  })
  @IsOptional()
  @IsString()
  preferredPaymentMethod?: string;

  @ApiPropertyOptional({
    description: 'User\'s notification preferences',
    example: ['email', 'sms', 'push'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notificationPreferences?: string[];

  @ApiPropertyOptional({
    description: 'User\'s marketing preferences',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @ApiPropertyOptional({
    description: 'User\'s terms and conditions acceptance date',
    example: '2024-01-01T00:00:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  termsAcceptedAt?: string;

  @ApiPropertyOptional({
    description: 'User\'s privacy policy acceptance date',
    example: '2024-01-01T00:00:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  privacyAcceptedAt?: string;
}
