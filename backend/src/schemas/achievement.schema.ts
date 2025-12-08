import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AchievementDocument = Achievement & Document;

export enum AchievementType {
  FIRST_GAME = 'first_game',
  MATH_MASTER = 'math_master',
  CODING_STAR = 'coding_star',
  PHYSICS_GENIUS = 'physics_genius',
  CHEMISTRY_WIZARD = 'chemistry_wizard',
  LANGUAGE_CHAMPION = 'language_champion',
  STREAK_MASTER = 'streak_master',
  POINTS_MILESTONE = 'points_milestone',
  GAME_COMPLETION = 'game_completion',
  DAILY_LEARNER = 'daily_learner',
}

@Schema({ timestamps: true })
export class Achievement {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  nameArabic?: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  descriptionArabic?: string;

  @Prop({ required: true, enum: AchievementType })
  type: AchievementType;

  @Prop()
  icon?: string;

  @Prop({ default: 0 })
  pointsReward: number;

  @Prop({ type: Object })
  criteria?: Record<string, any>; // Conditions to unlock (e.g., { gamesCompleted: 10 })
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

@Schema({ timestamps: true })
export class UserAchievement {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Achievement', required: true })
  achievementId: Types.ObjectId;

  @Prop({ default: Date.now })
  unlockedAt: Date;
}

export const UserAchievementSchema = SchemaFactory.createForClass(UserAchievement);
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export type UserAchievementDocument = UserAchievement & Document;

