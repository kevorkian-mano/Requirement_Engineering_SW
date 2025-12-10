import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserAchievements(@Request() req: any) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Request() req: any) {
    return this.achievementsService.getAchievementStats(req.user.id);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async getAllAchievements(@Request() req: any, @Query('includeProgress') includeProgress: string = 'true') {
    const userId = includeProgress === 'true' ? req.user.id : undefined;
    return this.achievementsService.getAllAchievements(userId);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async checkAndUnlock(@Request() req: any) {
    return this.achievementsService.checkAndUnlockAchievements(req.user.id);
  }
}
