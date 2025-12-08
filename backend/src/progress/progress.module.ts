import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Progress, ProgressSchema } from '../schemas/progress.schema';
import { Achievement, AchievementSchema, UserAchievement, UserAchievementSchema } from '../schemas/achievement.schema';
import { UsersModule } from '../users/users.module';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Progress.name, schema: ProgressSchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: UserAchievement.name, schema: UserAchievementSchema },
    ]),
    UsersModule,
    GamesModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}

