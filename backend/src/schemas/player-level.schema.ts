import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AgeGroup } from './user.schema';

export type PlayerLevelDocument = PlayerLevel & Document;

@Schema({ timestamps: true })
export class PlayerLevel {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: AgeGroup })
  ageGroup: AgeGroup;

  @Prop({ required: true, default: 1 })
  currentLevel: number; // 1-8

  @Prop({ required: true, default: 0 })
  currentXP: number; // XP in current level

  @Prop({ required: true, default: 0 })
  totalXPEarned: number; // Total XP earned across all levels

  @Prop({ required: true, default: 100 })
  xpNeededForNextLevel: number; // Dynamic threshold per level

  @Prop({ required: true, default: 0 })
  totalPoints: number; // Bonus points from achievements + gameplay

  @Prop({ type: [String], default: [] })
  unlockedGames: string[]; // Array of game ObjectIds unlocked

  @Prop({ type: [String], default: [] })
  lockedGames: string[]; // Games visible but locked

  @Prop({ required: true, default: false })
  hasEarnedTutorialReward: boolean; // "Getting Started" achievement

  @Prop({ type: Object, default: {} })
  levelUpHistory: {
    [level: number]: Date;
  }; // Track when each level was achieved

  @Prop({ required: true, default: 'Level 1: The Beginning' })
  currentLevelTitle: string;

  @Prop()
  currentLevelDescription: string;

  @Prop({ required: true, default: 0 })
  consecutiveDaysPlayed: number; // For bonus XP

  @Prop()
  lastPlayDate: Date; // Track for consecutive days

  @Prop({ required: true, default: 'Level 2: Basic Explorer' })
  nextLevelTitle: string;

  @Prop()
  nextLevelDescription: string;
}

export const PlayerLevelSchema = SchemaFactory.createForClass(PlayerLevel);
