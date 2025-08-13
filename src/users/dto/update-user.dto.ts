import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'User\'s current password (required for sensitive changes)',
    example: 'currentPassword123',
  })
  currentPassword?: string;

  @ApiPropertyOptional({
    description: 'New password (minimum 8 characters)',
    example: 'newSecurePassword456',
    minLength: 8,
    maxLength: 255,
  })
  newPassword?: string;

  @ApiPropertyOptional({
    description: 'Confirmation of new password',
    example: 'newSecurePassword456',
  })
  confirmNewPassword?: string;
}
