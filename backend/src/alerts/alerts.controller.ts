import { Controller, Get, Post, Body, Param, Query, Put, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument, UserRole } from '../schemas/user.schema';
import { AlertType, AlertSeverity } from '../schemas/alert.schema';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('detect')
  async detectThreats(
    @Body() body: { userId: string; content: string; type: 'cyberbullying' | 'inappropriate' },
    @CurrentUser() user: UserDocument,
  ) {
    const { userId, content, type } = body;

    if (type === 'cyberbullying') {
      return this.alertsService.detectCyberbullying(userId, content);
    } else if (type === 'inappropriate') {
      return this.alertsService.detectInappropriateContent(userId, content);
    }
  }

  @Post('check-gaming')
  async checkExcessiveGaming(
    @Body() body: { userId: string },
    @CurrentUser() user: UserDocument,
  ) {
    return this.alertsService.checkExcessiveGaming(body.userId);
  }

  @Get(':userId?')
  async getUserAlerts(
    @Param('userId') userId: string,
    @Query('unreadOnly') unreadOnly: string,
    @CurrentUser() user: UserDocument,
  ) {
    const targetUserId = userId || user._id.toString();
    return this.alertsService.getUserAlerts(
      targetUserId,
      user,
      unreadOnly === 'true',
    );
  }

  @Get('parent/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PARENT)
  async getParentAlerts(@CurrentUser() user: UserDocument) {
    return this.alertsService.getParentAlerts(user._id.toString());
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.alertsService.markAsRead(id, user._id.toString());
  }
}

