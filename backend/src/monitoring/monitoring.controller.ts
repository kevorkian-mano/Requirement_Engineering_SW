import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { ScreenTimeQueryDto } from './dto/screen-time-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument, UserRole } from '../schemas/user.schema';
import { ActivityType } from '../schemas/activity.schema';

@Controller('monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post('activity')
  async logActivity(
    @Body() body: { type: ActivityType; duration: number; gameId?: string; metadata?: any },
    @CurrentUser() user: UserDocument,
  ) {
    return this.monitoringService.logActivity(
      user._id.toString(),
      body.type,
      body.duration,
      body.gameId,
      body.metadata,
    );
  }

  @Get('screen-time/:userId?')
  async getScreenTime(
    @Param('userId') userId: string,
    @Query() query: ScreenTimeQueryDto,
    @CurrentUser() user: UserDocument,
  ) {
    const targetUserId = userId || user._id.toString();
    return this.monitoringService.getScreenTime(targetUserId, query, user);
  }

  @Get('activity/:userId?')
  async getActivityLog(
    @Param('userId') userId: string,
    @Query() query: ScreenTimeQueryDto,
    @CurrentUser() user: UserDocument,
  ) {
    const targetUserId = userId || user._id.toString();
    return this.monitoringService.getActivityLog(targetUserId, query, user);
  }

  @Get('class')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  async getClassActivity(@CurrentUser() user: UserDocument) {
    return this.monitoringService.getClassActivity(user._id.toString());
  }

  @Get('patterns/:userId?')
  async getBehaviorPatterns(
    @Param('userId') userId: string,
    @CurrentUser() user: UserDocument,
  ) {
    const targetUserId = userId || user._id.toString();
    return this.monitoringService.getBehaviorPatterns(targetUserId, user);
  }

  @Get('analytics/:userId?')
  async getAnalyticsSummary(
    @Param('userId') userId: string,
    @CurrentUser() user: UserDocument,
  ) {
    const targetUserId = userId || user._id.toString();
    return this.monitoringService.getAnalyticsSummary(targetUserId, user);
  }

  @Get('dashboard/:userId?')
  async getDashboardData(
    @Param('userId') userId: string,
    @Query() query: ScreenTimeQueryDto,
    @CurrentUser() user: UserDocument,
  ) {
    const targetUserId = userId || user._id.toString();
    
    // Get all dashboard data
    const [screenTime, activities, patterns] = await Promise.all([
      this.monitoringService.getScreenTime(targetUserId, query, user),
      this.monitoringService.getActivityLog(targetUserId, query, user),
      this.monitoringService.getBehaviorPatterns(targetUserId, user),
    ]);

    return {
      screenTime,
      activities: activities.slice(0, 20), // Last 20 activities
      patterns,
      summary: {
        totalActivities: activities.length,
        totalScreenTime: screenTime.totalMinutes,
        averageSessionDuration: activities.length > 0 
          ? Math.floor(screenTime.totalSeconds / activities.length / 60)
          : 0,
      },
    };
  }
}

