import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type XPTransactionDocument = XPTransaction & Document;

@Schema({ timestamps: true })
export class XPTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  xpEarned: number;

  @Prop({ required: true })
  source: 'game_completion' | 'high_score' | 'no_hints_bonus' | 'speed_bonus' | 'consecutive_days' | 'achievement' | 'manual_admin';

  @Prop()
  description: string;

  @Prop()
  gameId: Types.ObjectId;

  @Prop({
    type: {
      score: Number,
      difficulty: String,
      timeSeconds: Number,
      hintsUsed: Number,
      achievementId: String,
    },
    default: () => ({}),
  })
  metadata: {
    score?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    timeSeconds?: number;
    hintsUsed?: number;
    achievementId?: string;
  };

  @Prop({ required: true, default: false })
  levelUpTriggered: boolean;

  @Prop()
  previousLevel: number;

  @Prop()
  newLevel: number;

  @Prop({ required: true, default: true })
  isValid: boolean;
}

export const XPTransactionSchema = SchemaFactory.createForClass(XPTransaction);
