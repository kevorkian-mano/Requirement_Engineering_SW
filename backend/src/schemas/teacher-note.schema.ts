import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeacherNoteDocument = TeacherNote & Document;

@Schema({ timestamps: true })
export class TeacherNote {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  note: string;

  @Prop({
    enum: ['observation', 'concern', 'achievement', 'parent_contact', 'intervention', 'follow_up'],
  })
  noteType: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop()
  followUpDate: Date;

  @Prop({ default: false })
  followUpCompleted: boolean;
}

export const TeacherNoteSchema = SchemaFactory.createForClass(TeacherNote);

// Indexes
TeacherNoteSchema.index({ teacherId: 1, studentId: 1 });
TeacherNoteSchema.index({ studentId: 1, createdAt: -1 });
TeacherNoteSchema.index({ followUpDate: 1, followUpCompleted: 1 });
