import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerLevel, PlayerLevelSchema } from '../schemas/player-level.schema';
import { XPTransaction, XPTransactionSchema } from '../schemas/xp-transaction.schema';
import { Game, GameSchema } from '../schemas/game.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Progress, ProgressSchema } from '../schemas/progress.schema';
import { LevelProgressionService } from './level-progression.service';
import { GameUnlockService } from './game-unlock.service';
import { LevelsController } from './levels.controller';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlayerLevel.name, schema: PlayerLevelSchema },
      { name: XPTransaction.name, schema: XPTransactionSchema },
      { name: Game.name, schema: GameSchema },
      { name: User.name, schema: UserSchema },
      { name: Progress.name, schema: ProgressSchema },
    ]),
    GamesModule,
  ],
  providers: [LevelProgressionService, GameUnlockService],
  controllers: [LevelsController],
  exports: [LevelProgressionService, GameUnlockService],
})
export class LevelsModule {}
