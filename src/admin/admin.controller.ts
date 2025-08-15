import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminAuthGuard } from '../guard/admin.guard';
import { AdminRole, AdminStatus, AdminPermission } from './entities/admin.entity';
import { SuperAdminAuthGuard } from '../guard/superadmin.guard';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(SuperAdminAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Create a new admin account',
    description: 'Create a new administrative user account. This endpoint is restricted to existing administrators.',
  })
  @ApiBody({
    type: CreateAdminDto,
    description: 'Admin account data',
    examples: {
      moderator: {
        summary: 'Moderator Admin',
        description: 'Create a moderator admin account',
        value: {
          firstName: 'John',
          lastName: 'Moderator',
          email: 'moderator@carrental.com',
          phoneNumber: '+1234567890',
          password: 'moderatorPass123',
          role: AdminRole.MODERATOR,
          department: 'Customer Support',
          permissions: [AdminPermission.USER_MANAGEMENT, AdminPermission.REVIEW_MODERATION],
          employeeId: 'MOD001',
          hireDate: '2024-01-01',
          supervisor: 'Admin Manager',
          assignedRegions: ['North', 'South']
        } as unknown as CreateAdminDto
      },
      support: {
        summary: 'Support Admin',
        description: 'Create a support admin account',
        value: {
          firstName: 'Jane',
          lastName: 'Support',
          email: 'support@carrental.com',
          phoneNumber: '+1234567891',
          password: 'supportPass123',
          role: AdminRole.SUPPORT,
          department: 'Customer Service',
          permissions: [AdminPermission.SUPPORT, AdminPermission.ANALYTICS],
          employeeId: 'SUP001',
          hireDate: '2024-01-01',
          supervisor: 'Support Manager',
          assignedRegions: ['East', 'West']
        } as unknown as CreateAdminDto
      }
    }
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Admin account created successfully',
    schema: {
      type: 'object',
      properties: {
        admin: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'aa0e8400-e29b-41d4-a716-446655440000' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Moderator' },
            email: { type: 'string', example: 'moderator@carrental.com' },
            phoneNumber: { type: 'string', example: '+1234567890' },
            role: { type: 'string', example: 'moderator' },
            status: { type: 'string', example: 'active' },
            department: { type: 'string', example: 'Customer Support' },
            employeeId: { type: 'string', example: 'MOD001' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
          }
        },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' }, example: ['email must be an email', 'password must be longer than or equal to 8 characters'] },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only administrators can create admin accounts',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Only administrators can create admin accounts' }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Admin with this email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Admin with this email already exists' }
      }
    }
  })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Get()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Get all admin accounts',
    description: 'Retrieve a list of all administrative users. This endpoint is restricted to administrators.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: Number,
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
    type: Number,
    example: 10
  })
  @ApiQuery({
    name: 'role',
    description: 'Filter admins by role',
    required: false,
    enum: ['super_admin', 'admin', 'moderator', 'support'],
    example: 'moderator'
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter admins by status',
    required: false,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    example: 'active'
  })
  @ApiQuery({
    name: 'department',
    description: 'Filter admins by department',
    required: false,
    type: String,
    example: 'Customer Support'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin accounts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        admins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: 'aa0e8400-e29b-41d4-a716-446655440000' },
              firstName: { type: 'string', example: 'John' },
              lastName: { type: 'string', example: 'Moderator' },
              email: { type: 'string', example: 'moderator@carrental.com' },
              phoneNumber: { type: 'string', example: '+1234567890' },
              role: { type: 'string', example: 'moderator' },
              status: { type: 'string', example: 'active' },
              department: { type: 'string', example: 'Customer Support' },
              employeeId: { type: 'string', example: 'MOD001' },
              isOnline: { type: 'boolean', example: false },
              lastLoginAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
            }
          }
        },
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 3 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only administrators can access this endpoint',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Only administrators can access this endpoint' }
      }
    }
  })
  findAll() {
    return this.adminService.findAllAdmins();
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Get admin by ID',
    description: 'Retrieve detailed information about a specific administrative user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Admin ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: 'aa0e8400-e29b-41d4-a716-446655440000'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Admin retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: 'aa0e8400-e29b-41d4-a716-446655440000' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Moderator' },
        email: { type: 'string', example: 'moderator@carrental.com' },
        phoneNumber: { type: 'string', example: '+1234567890' },
        role: { type: 'string', example: 'moderator' },
        status: { type: 'string', example: 'active' },
        profilePicture: { type: 'string', example: 'https://example.com/admin-profile.jpg' },
        employeeId: { type: 'string', example: 'MOD001' },
        hireDate: { type: 'string', format: 'date', example: '2024-01-01' },
        department: { type: 'string', example: 'Customer Support' },
        supervisor: { type: 'string', example: 'Admin Manager' },
        assignedRegions: { type: 'array', items: { type: 'string' }, example: ['North', 'South'] },
        totalActions: { type: 'number', example: 150 },
        successfulActions: { type: 'number', example: 145 },
        failedActions: { type: 'number', example: 5 },
        lastLoginIp: { type: 'string', example: '192.168.1.1' },
        lastLoginLocation: { type: 'string', example: 'New York, USA' },
        isOnline: { type: 'boolean', example: false },
        notes: { type: 'string', example: 'Experienced moderator with excellent customer service skills' },
        requiresPasswordChange: { type: 'boolean', example: false },
        twoFactorEnabled: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only administrators can access this endpoint',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Only administrators can access this endpoint' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Admin not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Admin not found' }
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.adminService.findOneAdmin(id);
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Update admin account',
    description: 'Update an existing administrative user account. Only administrators can update admin accounts.',
  })
  @ApiParam({
    name: 'id',
    description: 'Admin ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: 'aa0e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    type: UpdateAdminDto,
    description: 'Admin update data',
    examples: {
      role: {
        summary: 'Update Role',
        description: 'Update admin role and permissions',
        value: {
          role: AdminRole.ADMIN,
          permissions: [AdminPermission.USER_MANAGEMENT, AdminPermission.CAR_MANAGEMENT, AdminPermission.ANALYTICS],
          department: 'Operations'
        } as unknown as UpdateAdminDto
      },
      status: {
        summary: 'Update Status',
        description: 'Update admin account status',
        value: {
          status: AdminStatus.SUSPENDED,
          notes: 'Account suspended due to policy violation'
        } as unknown as UpdateAdminDto
      },
      profile: {
        summary: 'Update Profile',
        description: 'Update admin profile information',
        value: {
          firstName: 'Johnny',
          lastName: 'Manager',
          phoneNumber: '+1234567899',
          profilePicture: 'https://example.com/new-profile.jpg'
        } as unknown as UpdateAdminDto
      }
    }
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Admin updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: 'aa0e8400-e29b-41d4-a716-446655440000' },
        firstName: { type: 'string', example: 'Johnny' },
        lastName: { type: 'string', example: 'Manager' },
        role: { type: 'string', example: 'admin' },
        status: { type: 'string', example: 'active' },
        department: { type: 'string', example: 'Operations' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' }, example: ['phoneNumber must be a valid phone number'] },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only administrators can update admin accounts',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Only administrators can update admin accounts' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Admin not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Admin not found' }
      }
    }
  })
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.updateAdmin(id, updateAdminDto);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Delete admin account',
    description: 'Delete an administrative user account. Only administrators can delete admin accounts.',
  })
  @ApiParam({
    name: 'id',
    description: 'Admin ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: 'aa0e8400-e29b-41d4-a716-446655440000'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in format: Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Admin account deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Admin account deleted successfully' },
        deletedAdminId: { type: 'string', format: 'uuid', example: 'aa0e8400-e29b-41d4-a716-446655440000' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only administrators can delete admin accounts',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Only administrators can delete admin accounts' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Admin not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Admin not found' }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete admin account',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Cannot delete the last super admin account' }
      }
    }
  })
  remove(@Param('id') id: string) {
    return this.adminService.removeAdmin(id);
  }
}
