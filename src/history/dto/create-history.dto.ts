import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min, Max, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RentalStatus } from '../entities/history.entity';

export class CreateHistoryDto {
  @ApiProperty({
    description: 'Car ID to rent',
    example: '9328109d-ad19-4a43-a4f8-2b34361aeb6d',
    format: 'uuid',
  })
  @IsUUID()
  carId: string;

  @ApiProperty({
    description: 'Start date of the rental',
    example: '2026-12-25T10:00:00Z',
    format: 'date-time',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the rental',
    example: '2026-12-27T18:00:00Z',
    format: 'date-time',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Pickup location for the rental',
    example: '123 Main St, Downtown, City',
    minLength: 10
  })
  @IsString()
  pickupLocation: string;

  @ApiProperty({
    description: 'Drop-off location for the rental',
    example: '456 Business Ave, Uptown, City',
    minLength: 10
  })
  @IsString()
  dropoffLocation: string;

  @ApiPropertyOptional({
    description: 'Rental status',
    enum: RentalStatus,
    example: RentalStatus.PENDING,
    default: RentalStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(RentalStatus)
  status?: RentalStatus;

  @ApiPropertyOptional({
    description: 'Additional notes for the rental',
    example: 'Please deliver the car with a full tank of gas',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Special requests for the rental',
    example: ['Child seat', 'GPS navigation', 'Insurance coverage'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialRequests?: string[];

  @ApiPropertyOptional({
    description: 'Pickup instructions',
    example: 'Meet at the main entrance of the building'
  })
  @IsOptional()
  @IsString()
  pickupInstructions?: string;

  @ApiPropertyOptional({
    description: 'Drop-off instructions',
    example: 'Leave the car in the designated parking area'
  })
  @IsOptional()
  @IsString()
  dropoffInstructions?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact name',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact phone',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({
    description: 'Insurance type selected for the rental',
    example: 'Comprehensive',
  })
  @IsOptional()
  @IsString()
  insuranceType?: string;

  @ApiPropertyOptional({
    description: 'Whether to include additional driver',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsString()
  additionalDriver?: string;

  @ApiPropertyOptional({
    description: 'Fuel policy preference',
    example: 'Full to Full',
  })
  @IsOptional()
  @IsString()
  fuelPolicy?: string;

  @ApiPropertyOptional({
    description: 'Mileage limit for the rental',
    example: 500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mileageLimit?: number;

  @ApiPropertyOptional({
    description: 'Whether to include roadside assistance',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsString()
  roadsideAssistance?: string;

  @ApiPropertyOptional({
    description: 'Payment method for the rental',
    example: 'Credit Card',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Discount code if applicable',
    example: 'SAVE20',
  })
  @IsOptional()
  @IsString()
  discountCode?: string;

  @ApiPropertyOptional({
    description: 'Rental purpose',
    example: 'Business trip',
  })
  @IsOptional()
  @IsString()
  rentalPurpose?: string;

  @ApiPropertyOptional({
    description: 'Expected return time (if different from end date)',
    example: '2026-12-27T16:00:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  expectedReturnTime?: string;

  @ApiPropertyOptional({
    description: 'Whether to include cleaning service',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsString()
  cleaningService?: string;

  @ApiPropertyOptional({
    description: 'Whether to include delivery service',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsString()
  deliveryService?: string;
}
