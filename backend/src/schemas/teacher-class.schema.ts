import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeacherClassDocument = TeacherClass & Document;

@Schema({ timestamps: true })
export class TeacherClass {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId;

  @Prop({ required: true })
  className: string;

  @Prop()
  grade: string;

  @Prop()
  subject: string;

  @Prop()
  academicYear: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  students: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Course', default: [] })
  courseIds: Types.ObjectId[]; // Courses this class is associated with

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description: string;

  @Prop({ type: Object, default: {} })
  settings: {
    enableLeaderboard?: boolean;
    enablePeerTutoring?: boolean;
    enableGroupChallenges?: boolean;
    allowStudentMessaging?: boolean;
    strictCyberbullyingMode?: boolean;
  };
}

export const TeacherClassSchema = SchemaFactory.createForClass(TeacherClass);

// Indexes
TeacherClassSchema.index({ teacherId: 1 });
TeacherClassSchema.index({ students: 1 });
TeacherClassSchema.index({ courseIds: 1 });
TeacherClassSchema.index({ isActive: 1 });
