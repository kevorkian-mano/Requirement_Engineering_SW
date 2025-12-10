import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CyberbullyingIncidentDocument = CyberbullyingIncident & Document;

@Schema({ timestamps: true })
export class CyberbullyingIncident {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedStudentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  victimStudentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  teacherId: Types.ObjectId;

  @Prop({ required: true })
  incidentType: 'text_analysis' | 'behavioral' | 'social_network' | 'manual_report';

  @Prop({ required: true })
  description: string;

  @Prop()
  flaggedContent: string;

  @Prop({ required: true })
  severity: 'low' | 'medium' | 'high' | 'critical';

  @Prop({ required: true, default: 'pending' })
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';

  @Prop({ type: [String], default: [] })
  flagReasons: string[];

  @Prop()
  teacherNotes: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy: Types.ObjectId;

  @Prop()
  resolvedAt: Date;

  @Prop({ required: true, default: 1 })
  offenderViolationCount: number;

  @Prop({ required: true, default: false })
  victimNotified: boolean;

  @Prop({ required: true, default: false })
  parentNotified: boolean;

  @Prop({ type: [String], default: [] })
  appliedConsequences: string[];

  @Prop({
    type: {
      screenshots: [String],
      conversationContext: String,
    },
    default: () => ({ screenshots: [], conversationContext: '' }),
  })
  evidence: {
    screenshots: string[];
    conversationContext: string;
  };
}

export const CyberbullyingIncidentSchema =
  SchemaFactory.createForClass(CyberbullyingIncident);
