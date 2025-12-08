import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../schemas/user.schema';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  async saveProgress(
    @Body() saveProgressDto: SaveProgressDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.progressService.saveProgress(user._id.toString(), saveProgressDto);
  }

  @Get()
  async getUserProgress(@CurrentUser() user: UserDocument) {
    return this.progressService.getUserProgress(user._id.toString());
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('ageGroup') ageGroup?: string,
    @Query('limit') limit?: string,
  ) {
    return this.progressService.getLeaderboard(ageGroup, limit ? parseInt(limit) : 10);
  }

  @Get('achievements')
  async getUserAchievements(@CurrentUser() user: UserDocument) {
    // Get all achievements and user's unlocked achievements
    const [allAchievements, userAchievements] = await Promise.all([
      this.progressService.getAllAchievements(),
      this.progressService.getUserAchievements(user._id.toString()),
    ]);

    // Create a map of unlocked achievements
    const unlockedMap = new Map();
    userAchievements.forEach((ua: any) => {
      const achievementId = typeof ua._id === 'string' ? ua._id : ua._id.toString();
      unlockedMap.set(achievementId, ua.unlockedAt);
    });

    // Merge all achievements with unlock status
    return allAchievements.map((achievement) => {
      const achievementId = achievement._id.toString();
      const unlockedAt = unlockedMap.get(achievementId);
      return {
        ...achievement.toObject(),
        unlockedAt: unlockedAt || null,
      };
    });
  }
}

