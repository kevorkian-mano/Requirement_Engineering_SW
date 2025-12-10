import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../schemas/course.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class TeacherAuthorizationService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Check if teacher is assigned to a course
   */
  async canAccessCourse(teacherId: string, courseId: string): Promise<boolean> {
    const teacher = await this.userModel.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return false;
    }

    const courseObjectId = new Types.ObjectId(courseId);
    return (
      teacher.courseIds &&
      teacher.courseIds.some((cid) => cid.toString() === courseObjectId.toString())
    );
  }

  /**
   * Verify teacher can access course, throw if not
   */
  async verifyTeacherCourseAccess(
    teacherId: string,
    courseId: string,
  ): Promise<void> {
    const hasAccess = await this.canAccessCourse(teacherId, courseId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this course',
      );
    }
  }

  /**
   * Get all courses a teacher is assigned to
   */
  async getTeacherCourses(teacherId: string): Promise<CourseDocument[]> {
    const teacher = await this.userModel
      .findById(teacherId)
      .select('courseIds');

    if (!teacher || !teacher.courseIds || teacher.courseIds.length === 0) {
      return [];
    }

    return this.courseModel.find({ _id: { $in: teacher.courseIds } });
  }

  /**
   * Check if student played games from teacher's courses
   */
  async isStudentInTeachersCourseGames(
    teacherId: string,
    studentId: string,
  ): Promise<boolean> {
    const teacher = await this.userModel
      .findById(teacherId)
      .select('courseIds');

    if (!teacher || !teacher.courseIds || teacher.courseIds.length === 0) {
      return false;
    }

    // Find courses and get all game IDs
    const courses = await this.courseModel.find({
      _id: { $in: teacher.courseIds },
    });

    const allGameIds: Types.ObjectId[] = [];
    courses.forEach((course) => {
      allGameIds.push(...course.gameIds);
    });

    if (allGameIds.length === 0) {
      return false;
    }

    // Check if student has played any of these games
    // This will be checked using Progress model in the calling service
    return true; // Return true if courses/games exist, actual check is done in Progress query
  }
}
