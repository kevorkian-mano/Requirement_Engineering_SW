import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProgressDocument = Progress & Document;

@Schema({ timestamps: true })
export class Progress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  gameId: Types.ObjectId;

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  pointsEarned: number;

  @Prop({ default: 0 })
  timeSpent: number; // in seconds

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ default: 0 })
  completionPercentage: number;

  @Prop({ type: Object })
  gameData?: Record<string, any>; // Store game-specific progress data

  @Prop()
  lastPlayedAt?: Date;

  @Prop({ default: 0 })
  playCount: number;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);
ProgressSchema.index({ userId: 1, gameId: 1 }, { unique: true });

