import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BehavioralAnomalyDocument = BehavioralAnomaly & Document;

@Schema({ timestamps: true })
export class BehavioralAnomaly {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  anomalyType: 'sudden_performance_drop' | 'game_avoidance' | 'excessive_play' | 'hint_pattern_change' | 'social_withdrawal';

  @Prop({ required: true })
  severity: 'low' | 'medium' | 'high';

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object })
  metrics: {
    previousAverageScore?: number;
    currentAverageScore?: number;
    changePercentage?: number;
    daysSinceNormalActivity?: number;
    previousPlayFrequency?: number;
    currentPlayFrequency?: number;
  };

  @Prop({ required: true, default: false })
  teacherNotified: boolean;

  @Prop()
  teacherResponse: string;

  @Prop({ required: true, default: 'new' })
  status: 'new' | 'investigating' | 'addressed' | 'resolved';

  @Prop()
  resolvedAt: Date;
}

export const BehavioralAnomalySchema =
  SchemaFactory.createForClass(BehavioralAnomaly);
