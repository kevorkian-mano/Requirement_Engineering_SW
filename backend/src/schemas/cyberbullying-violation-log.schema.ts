import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CyberbullyingViolationLogDocument = CyberbullyingViolationLog & Document;

@Schema({ timestamps: true })
export class CyberbullyingViolationLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  violationType: 'inappropriate_message' | 'harassment' | 'exclusion' | 'mocking' | 'threat';

  @Prop({ required: true, default: 1 })
  violationCount: number;

  @Prop({ required: true })
  firstViolationDate: Date;

  @Prop()
  lastViolationDate: Date;

  @Prop({ required: true, default: 'active' })
  status: 'active' | 'restricted' | 'banned' | 'resolved';

  @Prop()
  currentRestrictionEndDate: Date;

  @Prop({ type: [String], default: [] })
  appliedConsequences: string[];

  @Prop({ type: [Types.ObjectId], ref: 'CyberbullyingIncident', default: [] })
  relatedIncidents: Types.ObjectId[];
}

export const CyberbullyingViolationLogSchema =
  SchemaFactory.createForClass(CyberbullyingViolationLog);
