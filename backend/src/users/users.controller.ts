import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument, UserRole } from '../schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('children')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PARENT)
  async getChildren(@CurrentUser() user: UserDocument) {
    const children = await this.usersService.getChildren(user._id.toString());
    return children;
  }

  @Get('students')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  async getStudents(@CurrentUser() user: UserDocument) {
    const students = await this.usersService.getStudents(user._id.toString());
    return students;
  }

  @Get('parent')
  async getParent(@CurrentUser() user: UserDocument) {
    if (user.role !== UserRole.CHILD || !user.parentId) {
      return null;
    }
    const parent = await this.usersService.findById(user.parentId);
    return parent;
  }
}

