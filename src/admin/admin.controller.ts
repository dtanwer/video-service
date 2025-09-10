import { Controller, Get, Put, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id/ban')
  @ApiOperation({ summary: 'Ban a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  async banUser(@Param('id') userId: string) {
    return this.adminService.banUser(userId);
  }

  @Put('users/:id/unban')
  @ApiOperation({ summary: 'Unban a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully' })
  async unbanUser(@Param('id') userId: string) {
    return this.adminService.unbanUser(userId);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  async deleteUser(@Param('id') userId: string) {
    await this.adminService.deleteUser(userId);
  }
}