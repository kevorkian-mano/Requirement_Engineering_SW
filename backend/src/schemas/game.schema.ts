import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AgeGroup } from './user.schema';

export type GameDocument = Game & Document;

export enum GameCategory {
  PHYSICS = 'physics',
  CHEMISTRY = 'chemistry',
  MATH = 'math',
  LANGUAGE = 'language',
  CODING = 'coding',
  HISTORY = 'history',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Schema({ timestamps: true })
export class Game {
  @Prop({ required: true })
  title: string;

  @Prop()
  titleArabic?: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  descriptionArabic?: string;

  @Prop({ required: true, enum: GameCategory })
  category: GameCategory;

  @Prop({ required: true, enum: DifficultyLevel })
  difficulty: DifficultyLevel;

  @Prop({ required: true, type: [String], enum: AgeGroup })
  ageGroups: AgeGroup[];

  @Prop({ required: true })
  pointsReward: number;

  @Prop()
  thumbnail?: string;

  @Prop()
  gameUrl?: string; // URL to Phaser.js game

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  playCount: number;

  @Prop({ default: 0 })
  averageScore: number;

  @Prop({ type: Object })
  gameConfig?: Record<string, any>; // Phaser.js game configuration
}

export const GameSchema = SchemaFactory.createForClass(Game);

