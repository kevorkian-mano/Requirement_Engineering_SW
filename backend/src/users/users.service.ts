import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password');
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('-password');
  }

  async updatePoints(userId: string, points: number): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.points += points;
    
    // Calculate level based on points (100 points per level)
    const newLevel = Math.floor(user.points / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }
    
    return user.save();
  }

  async getChildren(parentId: string): Promise<UserDocument[]> {
    const parent = await this.userModel.findById(parentId);
    if (!parent || !parent.childrenIds) {
      return [];
    }
    return this.userModel.find({ _id: { $in: parent.childrenIds } }).select('-password');
  }

  async getStudents(teacherId: string): Promise<UserDocument[]> {
    const teacher = await this.userModel.findById(teacherId);
    if (!teacher || !teacher.studentsIds) {
      return [];
    }
    return this.userModel.find({ _id: { $in: teacher.studentsIds } }).select('-password');
  }

  async updateScreenTime(userId: string, minutes: number): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { totalScreenTime: minutes },
    });
  }
}

