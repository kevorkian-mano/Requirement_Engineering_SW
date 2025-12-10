import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { Achievement, AchievementSchema, UserAchievement, UserAchievementSchema } from '../schemas/achievement.schema';
import { Progress, ProgressSchema } from '../schemas/progress.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Game, GameSchema } from '../schemas/game.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Achievement.name, schema: AchievementSchema },
      { name: UserAchievement.name, schema: UserAchievementSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: User.name, schema: UserSchema },
      { name: Game.name, schema: GameSchema },
    ]),
  ],
  providers: [AchievementsService],
  controllers: [AchievementsController],
  exports: [AchievementsService],
})
export class AchievementsModule {}
