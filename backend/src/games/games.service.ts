import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../schemas/game.schema';
import { CreateGameDto } from './dto/create-game.dto';
import { AgeGroup } from '../schemas/user.schema';

@Injectable()
export class GamesService {
  constructor(@InjectModel(Game.name) private gameModel: Model<GameDocument>) {}

  async create(createGameDto: CreateGameDto): Promise<GameDocument> {
    const game = new this.gameModel(createGameDto);
    return game.save();
  }

  async findAll(ageGroup?: AgeGroup, category?: string): Promise<GameDocument[]> {
    const query: any = { isActive: true };

    // Fix: ageGroups is an array, so we need to use $in operator
    if (ageGroup) {
      query.ageGroups = { $in: [ageGroup] };
    }

    if (category) {
      query.category = category;
    }

    return this.gameModel.find(query).sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<GameDocument> {
    const game = await this.gameModel.findById(id);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  async incrementPlayCount(id: string): Promise<void> {
    await this.gameModel.findByIdAndUpdate(id, {
      $inc: { playCount: 1 },
    });
  }

  async updateAverageScore(id: string, score: number): Promise<void> {
    const game = await this.gameModel.findById(id);
    if (!game) {
      return;
    }

    // Calculate new average
    const totalScore = game.averageScore * game.playCount + score;
    const newPlayCount = game.playCount + 1;
    const newAverage = totalScore / newPlayCount;

    game.averageScore = newAverage;
    await game.save();
  }

  async findByCategory(category: string): Promise<GameDocument[]> {
    return this.gameModel.find({ category, isActive: true }).sort({ createdAt: -1 });
  }
}

