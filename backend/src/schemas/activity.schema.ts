import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;

export enum ActivityType {
  GAME_PLAYED = 'game_played',
  LEARNING_MODULE = 'learning_module',
  CREATIVE_PROJECT = 'creative_project',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  COMPETITION_JOINED = 'competition_joined',
}

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ActivityType })
  type: ActivityType;

  @Prop({ type: Types.ObjectId, ref: 'Game' })
  gameId?: Types.ObjectId;

  @Prop({ default: 0 })
  duration: number; // in seconds

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Additional activity data

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
ActivitySchema.index({ userId: 1, timestamp: -1 });
ActivitySchema.index({ userId: 1, type: 1, timestamp: -1 });

