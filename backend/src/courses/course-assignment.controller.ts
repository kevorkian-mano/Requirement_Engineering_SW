import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { TeacherAuthorizationService } from '../teachers/teacher-authorization.service';

@Controller('admin/course-assignments')
export class CourseAssignmentController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly teacherAuthService: TeacherAuthorizationService,
  ) {}

  /**
   * POST /admin/course-assignments/:courseId/teachers/:teacherId
   * Assign teacher to course (admin operation)
   */
  @Post(':courseId/teachers/:teacherId')
  async assignTeacherToCourse(
    @Param('courseId') courseId: string,
    @Param('teacherId') teacherId: string,
  ) {
    if (!courseId || !teacherId) {
      throw new HttpException(
        'courseId and teacherId are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.coursesService.addTeacher(courseId, teacherId);
  }

  /**
   * DELETE /admin/course-assignments/:courseId/teachers/:teacherId
   * Remove teacher from course (admin operation)
   */
  @Delete(':courseId/teachers/:teacherId')
  async removeTeacherFromCourse(
    @Param('courseId') courseId: string,
    @Param('teacherId') teacherId: string,
  ) {
    if (!courseId || !teacherId) {
      throw new HttpException(
        'courseId and teacherId are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.coursesService.removeTeacher(courseId, teacherId);
  }

  /**
   * PUT /admin/course-assignments/:courseId/teachers
   * Bulk assign multiple teachers to course
   */
  @Put(':courseId/teachers')
  async bulkAssignTeachers(
    @Param('courseId') courseId: string,
    @Body() body: { teacherIds: string[] },
  ) {
    if (!courseId || !body.teacherIds || body.teacherIds.length === 0) {
      throw new HttpException(
        'courseId and teacherIds array are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Get current course
    const course = await this.coursesService.findOne(courseId);
    if (!course) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    // Add new teachers
    let updatedCourse = course;
    for (const teacherId of body.teacherIds) {
      updatedCourse = await this.coursesService.addTeacher(courseId, teacherId);
    }

    return updatedCourse;
  }

  /**
   * GET /admin/course-assignments/:courseId/teachers
   * Get all teachers assigned to a course
   */
  @Get(':courseId/teachers')
  async getTeachersForCourse(@Param('courseId') courseId: string) {
    if (!courseId) {
      throw new HttpException('courseId is required', HttpStatus.BAD_REQUEST);
    }
    const course = await this.coursesService.findOne(courseId);
    return {
      courseId,
      courseName: course.name,
      teacherIds: course.teacherIds,
    };
  }

  /**
   * GET /admin/course-assignments/teacher/:teacherId
   * Get all courses assigned to a teacher
   */
  @Get('teacher/:teacherId')
  async getCoursesForTeacher(@Param('teacherId') teacherId: string) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.teacherAuthService.getTeacherCourses(teacherId);
  }
}
