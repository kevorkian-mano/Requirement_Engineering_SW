import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  CHILD = 'child',
  PARENT = 'parent',
  TEACHER = 'teacher',
}

export enum AgeGroup {
  AGES_3_5 = '3-5',
  AGES_6_8 = '6-8',
  AGES_9_12 = '9-12',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ enum: AgeGroup })
  ageGroup?: AgeGroup;

  @Prop()
  dateOfBirth?: Date;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  totalScreenTime: number; // in minutes

  @Prop({ type: String, ref: 'User' })
  parentId?: string; // For child users

  @Prop({ type: [String], ref: 'User', default: [] })
  childrenIds?: string[]; // For parent users

  @Prop({ type: [String], ref: 'User', default: [] })
  studentsIds?: string[]; // For teacher users

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  avatar?: string;

  @Prop({ default: 0 })
  loginStreak: number;

  @Prop()
  lastLoginDate?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

