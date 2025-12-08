import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AlertDocument = Alert & Document;

export enum AlertType {
  CYBERBULLYING = 'cyberbullying',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  EXCESSIVE_GAMING = 'excessive_gaming',
  POSITIVE_BEHAVIOR = 'positive_behavior',
  ACHIEVEMENT = 'achievement',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Schema({ timestamps: true })
export class Alert {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Child user

  @Prop({ type: Types.ObjectId, ref: 'User' })
  parentId?: Types.ObjectId; // Parent to notify

  @Prop({ type: Types.ObjectId, ref: 'User' })
  teacherId?: Types.ObjectId; // Teacher to notify

  @Prop({ required: true, enum: AlertType })
  type: AlertType;

  @Prop({ required: true, enum: AlertSeverity })
  severity: AlertSeverity;

  @Prop({ required: true })
  title: string;

  @Prop()
  titleArabic?: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  messageArabic?: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Additional alert data

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
AlertSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
AlertSchema.index({ parentId: 1, isRead: 1, createdAt: -1 });

