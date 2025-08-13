import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsArray, Length, IsDateString, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarStatus, CarType, FuelType, TransmissionType } from '../entities/car.entity';

export class CreateCarDto {
  @ApiProperty({
    description: 'Car brand/manufacturer',
    example: 'Toyota',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @Length(2, 50)
  brand: string;

  @ApiProperty({
    description: 'Car model',
    example: 'Camry',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @Length(1, 50)
  model: string;

  @ApiProperty({
    description: 'Car year of manufacture',
    example: 2023,
    minimum: 1900,
    maximum: 2030,
  })
  @IsNumber()
  @Min(1900)
  @Max(2030)
  year: number;

  @ApiProperty({
    description: 'Car license plate number',
    example: 'ABC-123',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @Length(3, 20)
  licensePlate: string;

  @ApiProperty({
    description: 'Car VIN (Vehicle Identification Number)',
    example: '1HGBH41JXMN109186',
    minLength: 17,
    maxLength: 17,
  })
  @IsString()
  @Length(17, 17)
  vin: string;

  @ApiProperty({
    description: 'Car color',
    example: 'Silver',
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @Length(2, 30)
  color: string;

  @ApiProperty({
    description: 'Car mileage in kilometers',
    example: 15000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  mileage: number;

  @ApiProperty({
    description: 'Car fuel type',
    enum: FuelType,
    example: FuelType.GASOLINE,
  })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty({
    description: 'Car transmission type',
    enum: TransmissionType,
    example: TransmissionType.AUTOMATIC,
  })
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @ApiProperty({
    description: 'Car type/category',
    enum: CarType,
    example: CarType.SEDAN,
  })
  @IsEnum(CarType)
  type: CarType;

  @ApiProperty({
    description: 'Number of seats in the car',
    example: 5,
    minimum: 1,
    maximum: 12,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  seats: number;

  @ApiProperty({
    description: 'Number of doors on the car',
    example: 4,
    minimum: 2,
    maximum: 6,
  })
  @IsNumber()
  @Min(2)
  @Max(6)
  doors: number;

  @ApiProperty({
    description: 'Car engine size in liters',
    example: 2.5,
    minimum: 0.5,
    maximum: 10.0,
  })
  @IsNumber()
  @Min(0.5)
  @Max(10.0)
  engineSize: number;

  @ApiProperty({
    description: 'Car horsepower',
    example: 200,
    minimum: 50,
    maximum: 1000,
  })
  @IsNumber()
  @Min(50)
  @Max(1000)
  horsepower: number;

  @ApiProperty({
    description: 'Daily rental rate in USD',
    example: 75.00,
    minimum: 10.00,
  })
  @IsNumber()
  @Min(10)
  dailyRate: number;

  @ApiProperty({
    description: 'Car status',
    enum: CarStatus,
    example: CarStatus.AVAILABLE,
    default: CarStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(CarStatus)
  status?: CarStatus;

  @ApiPropertyOptional({
    description: 'Car description',
    example: 'Comfortable sedan perfect for city driving and business trips',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Car features/amenities',
    example: ['Bluetooth', 'GPS', 'Backup Camera', 'Heated Seats'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({
    description: 'Car images URLs',
    example: ['https://example.com/car1.jpg', 'https://example.com/car2.jpg'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Car location/address',
    example: '123 Main St, Downtown, City',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Car city',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Car state/province',
    example: 'NY',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'Car country',
    example: 'USA',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Car postal code',
    example: '10001',
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Car latitude coordinate',
    example: 40.7128,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Car longitude coordinate',
    example: -74.0060,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Whether car has GPS navigation',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasGPS?: boolean;

  @ApiPropertyOptional({
    description: 'Whether car has Bluetooth connectivity',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasBluetooth?: boolean;

  @ApiPropertyOptional({
    description: 'Whether car has backup camera',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasBackupCamera?: boolean;

  @ApiPropertyOptional({
    description: 'Whether car has heated seats',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasHeatedSeats?: boolean;

  @ApiPropertyOptional({
    description: 'Whether car has sunroof',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasSunroof?: boolean;

  @ApiPropertyOptional({
    description: 'Car insurance information',
    example: 'Fully insured with comprehensive coverage',
  })
  @IsOptional()
  @IsString()
  insurance?: string;

  @ApiPropertyOptional({
    description: 'Car registration expiry date',
    example: '2025-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  registrationExpiry?: string;

  @ApiPropertyOptional({
    description: 'Car inspection expiry date',
    example: '2025-06-30',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  inspectionExpiry?: string;

  @ApiPropertyOptional({
    description: 'Car maintenance history',
    example: 'Regular maintenance every 5000 miles',
  })
  @IsOptional()
  @IsString()
  maintenanceHistory?: string;

  @ApiPropertyOptional({
    description: 'Car notes for renters',
    example: 'Please return with full tank. No smoking allowed.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
