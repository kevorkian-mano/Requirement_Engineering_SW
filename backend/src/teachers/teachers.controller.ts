import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument, UserRole } from '../schemas/user.schema';
import { TeacherDashboardService, ClassOverview, StudentStatus } from './teacher-dashboard.service';
import { TeacherMonitoringService } from './teacher-monitoring.service';
import { TeacherNotesService } from './teacher-notes.service';
import { ParentCommunicationService, WeeklyReport } from './parent-communication.service';
import { ReportGenerationService, ClassReport } from './report-generation.service';
import { TeacherCourseService } from './teacher-course.service';
import { TeacherAuthorizationService } from './teacher-authorization.service';

@Controller('teachers')
export class TeachersController {
  constructor(
    private readonly dashboardService: TeacherDashboardService,
    private readonly monitoringService: TeacherMonitoringService,
    private readonly notesService: TeacherNotesService,
    private readonly parentCommService: ParentCommunicationService,
    private readonly reportService: ReportGenerationService,
    private readonly courseService: TeacherCourseService,
    private readonly authService: TeacherAuthorizationService,
  ) {}

  // ============ DASHBOARD ENDPOINTS ============

  /**
   * GET /teachers/dashboard
   * Get overview of all classes for teacher
   */
  @Get('dashboard')
  async getDashboard(@Query('teacherId') teacherId: string): Promise<any> {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.dashboardService.getTeacherDashboard(teacherId);
  }

  /**
   * GET /teachers/classes
   * Get all classes for teacher
   */
  @Get('classes')
  async getClasses(@Query('teacherId') teacherId: string) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.dashboardService.getTeacherClasses(teacherId);
  }

  /**
   * GET /teachers/classes/:classId/overview
   * Get detailed overview of specific class
   */
  @Get('classes/:classId/overview')
  async getClassOverview(
    @Param('classId') classId: string,
    @Query('teacherId') teacherId: string,
  ): Promise<ClassOverview> {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.dashboardService.getClassOverview(teacherId, classId);
  }

  /**
   * GET /teachers/classes/:classId/students
   * Get list of all students in class with status
   */
  @Get('classes/:classId/students')
  async getClassStudents(
    @Param('classId') classId: string,
    @Query('teacherId') teacherId: string,
  ): Promise<StudentStatus[]> {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.dashboardService.getClassStudentList(teacherId, classId);
  }

  /**
   * GET /teachers/students/:studentId/status
   * Get detailed status for specific student
   */
  @Get('students/:studentId/status')
  async getStudentStatus(
    @Param('studentId') studentId: string,
    @Query('teacherId') teacherId: string,
  ): Promise<StudentStatus> {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.dashboardService.getStudentStatus(teacherId, studentId);
  }

  /**
   * GET /teachers/activity
   * Get recent activity feed for teacher
   */
  @Get('activity')
  async getActivity(
    @Query('teacherId') teacherId: string,
    @Query('limit') limit?: string,
  ) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.dashboardService.getRecentActivityForTeacher(
      teacherId,
      limit ? parseInt(limit) : 20,
    );
  }

  // ============ CLASS MANAGEMENT ENDPOINTS ============

  /**
   * POST /teachers/classes
   * Create new class
   */
  @Post('classes')
  async createClass(
    @Body()
    body: {
      teacherId: string;
      className: string;
      grade: string;
      subject: string;
      settings?: {
        enableLeaderboard?: boolean;
        enablePeerTutoring?: boolean;
        allowParentMessaging?: boolean;
        strictCyberbullyingMode?: boolean;
      };
    },
  ) {
    if (!body.teacherId || !body.className || !body.grade || !body.subject) {
      throw new HttpException(
        'teacherId, className, grade, and subject are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.dashboardService.createClass(body.teacherId, {
      className: body.className,
      grade: body.grade,
      subject: body.subject,
      settings: body.settings,
    });
  }

  /**
   * POST /teachers/classes/:classId/students
   * Add students to class
   */
  @Post('classes/:classId/students')
  async addStudentsToClass(
    @Param('classId') classId: string,
    @Body() body: { teacherId: string; studentIds: string[] },
  ) {
    if (!body.teacherId || !body.studentIds || body.studentIds.length === 0) {
      throw new HttpException(
        'teacherId and studentIds are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.dashboardService.addStudentsToClass(
      body.teacherId,
      classId,
      body.studentIds,
    );
  }

  /**
   * DELETE /teachers/classes/:classId/students/:studentId
   * Remove student from class
   */
  @Delete('classes/:classId/students/:studentId')
  async removeStudentFromClass(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
    @Query('teacherId') teacherId: string,
  ) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.dashboardService.removeStudentFromClass(
      teacherId,
      classId,
      studentId,
    );
  }

  /**
   * PUT /teachers/classes/:classId/settings
   * Update class settings
   */
  @Put('classes/:classId/settings')
  async updateClassSettings(
    @Param('classId') classId: string,
    @Body()
    body: {
      teacherId: string;
      settings: {
        enableLeaderboard?: boolean;
        enablePeerTutoring?: boolean;
        allowParentMessaging?: boolean;
        strictCyberbullyingMode?: boolean;
      };
    },
  ) {
    if (!body.teacherId || !body.settings) {
      throw new HttpException(
        'teacherId and settings are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.dashboardService.updateClassSettings(
      body.teacherId,
      classId,
      body.settings,
    );
  }

  // ============ ALERT/MONITORING ENDPOINTS ============

  /**
   * GET /teachers/alerts
   * Get alerts with optional filters
   */
  @Get('alerts')
  async getAlerts(
    @Query('teacherId') teacherId: string,
    @Query('classId') classId?: string,
    @Query('studentId') studentId?: string,
    @Query('alertType') alertType?: string,
    @Query('priority') priority?: string,
    @Query('isRead') isRead?: string,
    @Query('isResolved') isResolved?: string,
    @Query('limit') limit?: string,
  ) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }

    const filters: any = {};
    if (classId) filters.classId = classId;
    if (studentId) filters.studentId = studentId;
    if (alertType) filters.alertType = alertType;
    if (priority) filters.priority = priority;
    if (isRead !== undefined) filters.isRead = isRead === 'true';
    if (isResolved !== undefined) filters.isResolved = isResolved === 'true';

    return this.monitoringService.getAlerts(
      teacherId,
      filters,
      limit ? parseInt(limit) : 50,
    );
  }

  /**
   * GET /teachers/alerts/unread
   * Get unread alerts
   */
  @Get('alerts/unread')
  async getUnreadAlerts(
    @Query('teacherId') teacherId: string,
    @Query('limit') limit?: string,
  ) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.monitoringService.getUnreadAlerts(
      teacherId,
      limit ? parseInt(limit) : 20,
    );
  }

  /**
   * GET /teachers/alerts/statistics
   * Get alert statistics
   */
  @Get('alerts/statistics')
  async getAlertStatistics(@Query('teacherId') teacherId: string) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.monitoringService.getAlertStatistics(teacherId);
  }

  /**
   * POST /teachers/alerts
   * Create new alert manually
   */
  @Post('alerts')
  async createAlert(
    @Body()
    body: {
      teacherId: string;
      classId?: string;
      studentId: string;
      alertType: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      message: string;
      metadata?: any;
    },
  ) {
    if (
      !body.teacherId ||
      !body.studentId ||
      !body.alertType ||
      !body.priority ||
      !body.title ||
      !body.message
    ) {
      throw new HttpException(
        'teacherId, studentId, alertType, priority, title, and message are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.monitoringService.createAlert(body);
  }

  /**
   * POST /teachers/alerts/:alertId/read
   * Mark alert as read
   */
  @Post('alerts/:alertId/read')
  async markAlertAsRead(
    @Param('alertId') alertId: string,
    @Body() body: { teacherId: string },
  ) {
    if (!body.teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.monitoringService.markAlertAsRead(body.teacherId, alertId);
  }

  /**
   * POST /teachers/alerts/bulk-read
   * Mark multiple alerts as read
   */
  @Post('alerts/bulk-read')
  async markAlertsAsRead(
    @Body() body: { teacherId: string; alertIds: string[] },
  ) {
    if (!body.teacherId || !body.alertIds || body.alertIds.length === 0) {
      throw new HttpException(
        'teacherId and alertIds are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.monitoringService.markAlertsAsRead(body.teacherId, body.alertIds);
  }

  /**
   * POST /teachers/alerts/:alertId/resolve
   * Resolve alert with notes
   */
  @Post('alerts/:alertId/resolve')
  async resolveAlert(
    @Param('alertId') alertId: string,
    @Body() body: { teacherId: string; resolutionNotes: string },
  ) {
    if (!body.teacherId || !body.resolutionNotes) {
      throw new HttpException(
        'teacherId and resolutionNotes are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.monitoringService.resolveAlert(
      body.teacherId,
      alertId,
      body.resolutionNotes,
    );
  }

  // ============ NOTES ENDPOINTS ============

  /**
   * GET /teachers/students/:studentId/notes
   * Get all notes for specific student
   */
  @Get('students/:studentId/notes')
  async getStudentNotes(
    @Param('studentId') studentId: string,
    @Query('teacherId') teacherId: string,
    @Query('noteType') noteType?: string,
    @Query('tags') tags?: string,
    @Query('onlyPending') onlyPending?: string,
  ) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }

    const filters: any = {};
    if (noteType) filters.noteType = noteType;
    if (tags) filters.tags = tags.split(',');
    if (onlyPending !== undefined) filters.onlyPending = onlyPending === 'true';

    return this.notesService.getStudentNotes(teacherId, studentId, filters);
  }

  /**
   * GET /teachers/notes
   * Get all notes for teacher
   */
  @Get('notes')
  async getAllNotes(
    @Query('teacherId') teacherId: string,
    @Query('limit') limit?: string,
  ) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.getAllNotes(
      teacherId,
      limit ? parseInt(limit) : 100,
    );
  }

  /**
   * GET /teachers/notes/pending
   * Get notes with pending follow-ups
   */
  @Get('notes/pending')
  async getPendingFollowUps(@Query('teacherId') teacherId: string) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.getPendingFollowUps(teacherId);
  }

  /**
   * GET /teachers/notes/statistics
   * Get note statistics
   */
  @Get('notes/statistics')
  async getNoteStatistics(@Query('teacherId') teacherId: string) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.getNoteStatistics(teacherId);
  }

  /**
   * POST /teachers/notes
   * Create new note
   */
  @Post('notes')
  async createNote(
    @Body()
    body: {
      teacherId: string;
      studentId: string;
      note: string;
      noteType: 'observation' | 'concern' | 'achievement' | 'parent_contact' | 'intervention' | 'follow_up';
      tags?: string[];
      isPrivate?: boolean;
      followUpDate?: Date;
    },
  ) {
    if (!body.teacherId || !body.studentId || !body.note || !body.noteType) {
      throw new HttpException(
        'teacherId, studentId, note, and noteType are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.notesService.createNote(body);
  }

  /**
   * PUT /teachers/notes/:noteId
   * Update existing note
   */
  @Put('notes/:noteId')
  async updateNote(
    @Param('noteId') noteId: string,
    @Body()
    body: {
      teacherId: string;
      note?: string;
      tags?: string[];
      followUpDate?: Date;
      isPrivate?: boolean;
    },
  ) {
    if (!body.teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.updateNote(body.teacherId, noteId, body);
  }

  /**
   * POST /teachers/notes/:noteId/complete-followup
   * Mark follow-up as completed
   */
  @Post('notes/:noteId/complete-followup')
  async completeFollowUp(
    @Param('noteId') noteId: string,
    @Body() body: { teacherId: string },
  ) {
    if (!body.teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.completeFollowUp(body.teacherId, noteId);
  }

  /**
   * DELETE /teachers/notes/:noteId
   * Delete note
   */
  @Delete('notes/:noteId')
  async deleteNote(
    @Param('noteId') noteId: string,
    @Query('teacherId') teacherId: string,
  ) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.notesService.deleteNote(teacherId, noteId);
  }

  // ============ PARENT COMMUNICATION ENDPOINTS ============

  /**
   * GET /teachers/students/:studentId/weekly-report
   * Generate weekly report for student
   */
  @Get('students/:studentId/weekly-report')
  async getWeeklyReport(@Param('studentId') studentId: string): Promise<WeeklyReport> {
    return this.parentCommService.generateWeeklyReport(studentId);
  }

  /**
   * GET /teachers/students/:studentId/parent-email
   * Generate parent email content
   */
  @Get('students/:studentId/parent-email')
  async generateParentEmail(@Param('studentId') studentId: string) {
    return this.parentCommService.generateParentEmail(studentId);
  }

  /**
   * POST /teachers/students/:studentId/cyberbullying-notification
   * Generate cyberbullying notification for parents
   */
  @Post('students/:studentId/cyberbullying-notification')
  async generateCyberbullyingNotification(
    @Param('studentId') studentId: string,
    @Body()
    body: {
      incidentType: string;
      severity: string;
      isVictim: boolean;
    },
  ) {
    if (!body.incidentType || !body.severity || body.isVictim === undefined) {
      throw new HttpException(
        'incidentType, severity, and isVictim are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.parentCommService.generateCyberbullyingNotification(
      studentId,
      body.incidentType,
      body.severity,
      body.isVictim,
    );
  }

  // ============ REPORT GENERATION ENDPOINTS ============

  /**
   * GET /teachers/classes/:classId/reports/weekly
   * Generate weekly class report
   */
  @Get('classes/:classId/reports/weekly')
  async getWeeklyClassReport(
    @Param('classId') classId: string,
    @Query('teacherId') teacherId: string,
  ): Promise<ClassReport> {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.reportService.generateWeeklyClassReport(teacherId, classId);
  }

  /**
   * GET /teachers/classes/:classId/reports/monthly
   * Generate monthly class report
   */
  @Get('classes/:classId/reports/monthly')
  async getMonthlyClassReport(
    @Param('classId') classId: string,
    @Query('teacherId') teacherId: string,
  ): Promise<ClassReport> {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.reportService.generateMonthlyClassReport(teacherId, classId);
  }

  /**
   * GET /teachers/classes/:classId/reports/custom
   * Generate custom date range report
   */
  @Get('classes/:classId/reports/custom')
  async getCustomClassReport(
    @Param('classId') classId: string,
    @Query('teacherId') teacherId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ClassReport> {
    if (!teacherId || !startDate || !endDate) {
      throw new HttpException(
        'teacherId, startDate, and endDate are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.reportService.generateCustomClassReport(
      teacherId,
      classId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * GET /teachers/classes/:classId/reports/html
   * Generate HTML report
   */
  @Get('classes/:classId/reports/html')
  async getHtmlReport(
    @Param('classId') classId: string,
    @Query('teacherId') teacherId: string,
    @Query('type') type: 'weekly' | 'monthly' = 'weekly',
  ) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    const html = await this.reportService.generateHtmlReport(
      teacherId,
      classId,
      type,
    );
    return { html };
  }

  // ============ COURSE-BASED STUDENT ACTIVITY ENDPOINTS ============

  /**
   * GET /teachers/courses
   * Get all courses the teacher is responsible for
   */
  @Get('courses')
  async getTeacherCourses(@Query('teacherId') teacherId: string) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.courseService.getTeacherCourses(teacherId);
  }

  /**
   * GET /teachers/courses/dashboard
   * Get teacher course dashboard with summary stats
   */
  @Get('courses/dashboard')
  async getCoursesDashboard(@Query('teacherId') teacherId: string) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.courseService.getTeacherCourseDashboard(teacherId);
  }

  /**
   * GET /teachers/courses/:courseId/students
   * Get all students who played games in a specific course
   */
  @Get('courses/:courseId/students')
  async getCourseStudents(
    @Param('courseId') courseId: string,
    @Query('teacherId') teacherId: string,
  ) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.courseService.getCourseStudents(teacherId, courseId);
  }

  /**
   * GET /teachers/courses/:courseId/students/:studentId/activity
   * Get detailed activity of a student in a specific course
   */
  @Get('courses/:courseId/students/:studentId/activity')
  async getCourseStudentActivity(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @Query('teacherId') teacherId: string,
  ) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.courseService.getCourseStudentActivity(teacherId, courseId, studentId);
  }

  /**
   * GET /teachers/courses/:courseId/students/:studentId/activity/range
   * Get student activity in a course by date range
   */
  @Get('courses/:courseId/students/:studentId/activity/range')
  async getCourseStudentActivityByRange(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @Query('teacherId') teacherId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!teacherId || !startDate || !endDate) {
      throw new HttpException(
        'teacherId, startDate, and endDate are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.courseService.getCourseStudentActivityByDateRange(
      teacherId,
      courseId,
      studentId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * GET /teachers/courses/:courseId/games/activity
   * Get activity statistics for all games in a course
   */
  @Get('courses/:courseId/games/activity')
  async getCourseGameActivity(
    @Param('courseId') courseId: string,
    @Query('teacherId') teacherId: string,
  ) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }

    // Verify teacher has access to this course
    await this.authService.verifyTeacherCourseAccess(teacherId, courseId);

    return this.courseService.getCourseGameActivity(teacherId, courseId);
  }

  // ============ SECURE COURSE-BASED ENDPOINTS (WITH AUTHORIZATION) ============

  /**
   * GET /teachers/secure/my-courses
   * Get all courses assigned to the authenticated teacher
   */
  @Get('secure/my-courses')
  @UseGuards(JwtAuthGuard)
  async getMyCoursesSecure(@CurrentUser() user: UserDocument) {
    if (!user || user.role !== UserRole.TEACHER) {
      throw new HttpException('Unauthorized: Only teachers can access this endpoint', HttpStatus.FORBIDDEN);
    }
    return this.authService.getTeacherCourses(user._id.toString());
  }

  /**
   * GET /teachers/secure/courses/:courseId/students
   * Get all students who played games in teacher's course (with authorization)
   */
  @Get('secure/courses/:courseId/students')
  @UseGuards(JwtAuthGuard)
  async getCourseStudentsSecure(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserDocument,
  ) {
    if (!user || user.role !== UserRole.TEACHER) {
      throw new HttpException('Unauthorized: Only teachers can access this endpoint', HttpStatus.FORBIDDEN);
    }

    const teacherId = user._id.toString();

    // Verify teacher has access to this course
    await this.authService.verifyTeacherCourseAccess(teacherId, courseId);

    return this.courseService.getCourseStudents(teacherId, courseId);
  }

  /**
   * GET /teachers/secure/courses/:courseId/students/:studentId/full-activity
   * Get complete student activity in teacher's course (with authorization)
   */
  @Get('secure/courses/:courseId/students/:studentId/full-activity')
  @UseGuards(JwtAuthGuard)
  async getCourseStudentFullActivitySecure(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: UserDocument,
  ) {
    if (!user || user.role !== UserRole.TEACHER) {
      throw new HttpException('Unauthorized: Only teachers can access this endpoint', HttpStatus.FORBIDDEN);
    }

    const teacherId = user._id.toString();

    // Verify teacher has access to this course
    await this.authService.verifyTeacherCourseAccess(teacherId, courseId);

    return this.courseService.getCourseStudentActivity(teacherId, courseId, studentId);
  }

  /**
   * GET /teachers/secure/courses/:courseId/reports/students
   * Get comprehensive report of all students in teacher's course
   */
  @Get('secure/courses/:courseId/reports/students')
  @UseGuards(JwtAuthGuard)
  async getCourseStudentReportSecure(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserDocument,
    @Query('sortBy') sortBy: 'name' | 'pointsEarned' | 'lastActive' = 'name',
  ) {
    if (!user || user.role !== UserRole.TEACHER) {
      throw new HttpException('Unauthorized: Only teachers can access this endpoint', HttpStatus.FORBIDDEN);
    }

    const teacherId = user._id.toString();

    // Verify teacher has access to this course
    await this.authService.verifyTeacherCourseAccess(teacherId, courseId);

    const students = await this.courseService.getCourseStudents(teacherId, courseId);

    // Sort students based on sortBy parameter
    const sortedStudents = [...students].sort((a, b) => {
      switch (sortBy) {
        case 'pointsEarned':
          return b.totalPointsEarned - a.totalPointsEarned;
        case 'lastActive':
          return (
            (b.lastActive?.getTime() || 0) - (a.lastActive?.getTime() || 0)
          );
        case 'name':
        default:
          return a.studentName.localeCompare(b.studentName);
      }
    });

    return {
      courseId,
      totalStudents: sortedStudents.length,
      students: sortedStudents,
      generatedAt: new Date(),
    };
  }

  /**
   * GET /teachers/secure/courses/:courseId/analytics
   * Get analytics and insights for a course
   */
  @Get('secure/courses/:courseId/analytics')
  @UseGuards(JwtAuthGuard)
  async getCourseAnalyticsSecure(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserDocument,
  ) {
    if (!user || user.role !== UserRole.TEACHER) {
      throw new HttpException('Unauthorized: Only teachers can access this endpoint', HttpStatus.FORBIDDEN);
    }

    const teacherId = user._id.toString();

    // Verify teacher has access to this course
    await this.authService.verifyTeacherCourseAccess(teacherId, courseId);

    const students = await this.courseService.getCourseStudents(teacherId, courseId);
    const gameActivity = await this.courseService.getCourseGameActivity(
      teacherId,
      courseId,
    );

    // Calculate analytics
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.healthStatus !== 'critical').length;
    const totalPointsDistributed = students.reduce(
      (sum, s) => sum + s.totalPointsEarned,
      0,
    );
    const avgPointsPerStudent = totalStudents > 0 ? totalPointsDistributed / totalStudents : 0;
    const avgGamesPlayedPerStudent =
      totalStudents > 0
        ? students.reduce((sum, s) => sum + s.totalGamesPlayed, 0) / totalStudents
        : 0;
    const avgCompletionRate =
      totalStudents > 0
        ? students.reduce((sum, s) => {
            const rate =
              s.totalGamesPlayed > 0
                ? (s.completedGames / s.totalGamesPlayed) * 100
                : 0;
            return sum + rate;
          }, 0) / totalStudents
        : 0;

    return {
      courseId,
      timestamp: new Date(),
      studentMetrics: {
        totalStudents,
        activeStudents,
        inactiveOrCriticalStudents: totalStudents - activeStudents,
        activitiesPercentage: totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(2) + '%' : '0%',
      },
      pointsMetrics: {
        totalPointsDistributed,
        avgPointsPerStudent: avgPointsPerStudent.toFixed(2),
      },
      engagementMetrics: {
        avgGamesPlayedPerStudent: avgGamesPlayedPerStudent.toFixed(2),
        avgCompletionRate: avgCompletionRate.toFixed(2) + '%',
      },
      gameMetrics: gameActivity,
      topPerformers: students
        .sort((a, b) => b.totalPointsEarned - a.totalPointsEarned)
        .slice(0, 5)
        .map((s) => ({
          studentName: s.studentName,
          pointsEarned: s.totalPointsEarned,
          gamesCompleted: s.completedGames,
        })),
      needsAttention: students
        .filter((s) => s.healthStatus !== 'healthy')
        .map((s) => ({
          studentName: s.studentName,
          status: s.healthStatus,
          lastActive: s.lastActive,
        })),
    };
  }

  /**
   * GET /teachers/secure/courses/:courseId/games
   * Get all games associated with a course
   */
  @Get('secure/courses/:courseId/games')
  @UseGuards(JwtAuthGuard)
  async getCourseGamesSecure(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserDocument,
  ) {
    if (!user || user.role !== UserRole.TEACHER) {
      throw new HttpException('Unauthorized: Only teachers can access this endpoint', HttpStatus.FORBIDDEN);
    }

    const teacherId = user._id.toString();

    // Verify teacher has access to this course
    await this.authService.verifyTeacherCourseAccess(teacherId, courseId);

    return this.courseService.getCourseGames(teacherId, courseId);
  }
}
