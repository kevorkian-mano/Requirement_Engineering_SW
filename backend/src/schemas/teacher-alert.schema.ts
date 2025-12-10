import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeacherAlertDocument = TeacherAlert & Document;

@Schema({ timestamps: true })
export class TeacherAlert {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TeacherClass' })
  classId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'low_engagement',
      'no_activity',
      'behavioral_concern',
      'cyberbullying_incident',
      'struggling_student',
      'achievement_milestone',
      'level_up',
      'rapid_progress',
      'distress_pattern',
      'parent_contact_needed',
    ],
  })
  alertType: string;

  @Prop({ required: true, enum: ['low', 'medium', 'high', 'critical'] })
  priority: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  metadata: any;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt: Date;

  @Prop({ default: false })
  isResolved: boolean;

  @Prop()
  resolvedAt: Date;

  @Prop()
  resolutionNotes: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  resolvedBy: Types.ObjectId;
}

export const TeacherAlertSchema = SchemaFactory.createForClass(TeacherAlert);

// Indexes
TeacherAlertSchema.index({ teacherId: 1, isRead: 1 });
TeacherAlertSchema.index({ teacherId: 1, isResolved: 1 });
TeacherAlertSchema.index({ studentId: 1 });
TeacherAlertSchema.index({ alertType: 1 });
TeacherAlertSchema.index({ priority: 1 });
TeacherAlertSchema.index({ createdAt: -1 });
