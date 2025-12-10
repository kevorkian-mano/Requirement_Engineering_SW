import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  nameArabic?: string;

  @Prop()
  descriptionArabic?: string;

  @Prop({ required: true })
  code: string; // Unique course code (e.g., "CS101", "MATH201")

  @Prop()
  level?: string; // e.g., "Beginner", "Intermediate", "Advanced"

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  teacherIds: Types.ObjectId[]; // Teachers responsible for this course

  @Prop({ type: [Types.ObjectId], ref: 'Game', default: [] })
  gameIds: Types.ObjectId[]; // Games assigned to this course

  @Prop({ type: [String], default: [] })
  topics?: string[]; // Course topics

  @Prop()
  subject?: string; // Subject area (Math, Physics, Chemistry, etc.)

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  studentCount: number;

  @Prop()
  academicYear?: string;

  @Prop({ type: Object, default: {} })
  settings: {
    enableGameBasedLearning?: boolean;
    enableLeaderboard?: boolean;
    enableTeamWork?: boolean;
    minGamesRequired?: number;
  };
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Indexes
CourseSchema.index({ code: 1 }, { unique: true });
CourseSchema.index({ teacherIds: 1 });
CourseSchema.index({ gameIds: 1 });
CourseSchema.index({ isActive: 1 });
