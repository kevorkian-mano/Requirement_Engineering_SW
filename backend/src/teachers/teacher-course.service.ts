import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TeacherClass, TeacherClassDocument } from '../schemas/teacher-class.schema';
import { Course, CourseDocument } from '../schemas/course.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Progress, ProgressDocument } from '../schemas/progress.schema';
import { Game, GameDocument } from '../schemas/game.schema';
import { PlayerLevel, PlayerLevelDocument } from '../schemas/player-level.schema';
import { CyberbullyingIncident, CyberbullyingIncidentDocument } from '../schemas/cyberbullying-incident.schema';

export interface CourseStudentActivity {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalGamesPlayed: number;
  completedGames: number;
  totalPointsEarned: number;
  currentLevel: number;
  lastActive: Date;
  gameProgress: {
    gameId: string;
    gameTitle: string;
    playCount: number;
    score: number;
    timeSpent: number;
    isCompleted: boolean;
    completionPercentage: number;
    lastPlayedAt: Date;
  }[];
  recentActivities: any[];
  healthStatus: 'healthy' | 'concerning' | 'critical';
}

@Injectable()
export class TeacherCourseService {
  private readonly logger = new Logger(TeacherCourseService.name);

  constructor(
    @InjectModel(TeacherClass.name)
    private teacherClassModel: Model<TeacherClassDocument>,
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Progress.name)
    private progressModel: Model<ProgressDocument>,
    @InjectModel(Game.name)
    private gameModel: Model<GameDocument>,
    @InjectModel(PlayerLevel.name)
    private playerLevelModel: Model<PlayerLevelDocument>,
    @InjectModel(CyberbullyingIncident.name)
    private cyberbullyingIncidentModel: Model<CyberbullyingIncidentDocument>,
  ) {}

  /**
   * Get all courses responsible by teacher
   */
  async getTeacherCourses(teacherId: string): Promise<CourseDocument[]> {
    const courses = await this.courseModel
      .find({ teacherIds: new Types.ObjectId(teacherId), isActive: true })
      .populate('gameIds', 'title category difficulty pointsReward')
      .sort({ createdAt: -1 });

    if (!courses || courses.length === 0) {
      this.logger.log(`No courses found for teacher ${teacherId}`);
    }

    return courses;
  }

  /**
   * Get all students who played games related to a specific course
   */
  async getCourseStudents(
    teacherId: string,
    courseId: string,
  ): Promise<CourseStudentActivity[]> {
    // Verify teacher is responsible for this course
    const course = await this.courseModel.findOne({
      _id: new Types.ObjectId(courseId),
      teacherIds: new Types.ObjectId(teacherId),
    });

    if (!course) {
      throw new NotFoundException(
        'Course not found or teacher is not responsible for this course',
      );
    }

    // Get all students who played games from this course
    const gameIds = course.gameIds;

    if (gameIds.length === 0) {
      return [];
    }

    // Find all progress records for games in this course
    const progressRecords = await this.progressModel
      .find({ gameId: { $in: gameIds } })
      .distinct('userId');

    // Get detailed activity for each student
    const studentActivities = await Promise.all(
      progressRecords.map((studentId) =>
        this.getCourseStudentActivity(teacherId, courseId, studentId.toString()),
      ),
    );

    return studentActivities.filter((activity) => activity !== null);
  }

  /**
   * Get detailed activity for a specific student in a course
   */
  async getCourseStudentActivity(
    teacherId: string,
    courseId: string,
    studentId: string,
  ): Promise<CourseStudentActivity | null> {
    // Verify teacher is responsible for this course
    const course = await this.courseModel.findOne({
      _id: new Types.ObjectId(courseId),
      teacherIds: new Types.ObjectId(teacherId),
    });

    if (!course) {
      throw new NotFoundException(
        'Course not found or teacher is not responsible for this course',
      );
    }

    // Get student details
    const student = await this.userModel.findById(studentId);
    if (!student) {
      return null;
    }

    const gameIds = course.gameIds;
    if (gameIds.length === 0) {
      return null;
    }

    // Get all progress for this student in course games
    const progressRecords = await this.progressModel.find({
      userId: new Types.ObjectId(studentId),
      gameId: { $in: gameIds },
    }).populate('gameId', 'title category difficulty pointsReward');

    // Calculate totals
    const totalGamesPlayed = progressRecords.length;
    const completedGames = progressRecords.filter((p) => p.isCompleted).length;
    const totalPointsEarned = progressRecords.reduce(
      (sum, p) => sum + (p.pointsEarned || 0),
      0,
    );

    // Get player level
    const playerLevel = await this.playerLevelModel.findOne({
      userId: new Types.ObjectId(studentId),
    });

    // Get last active date
    const lastProgress = await this.progressModel
      .findOne({ userId: new Types.ObjectId(studentId), gameId: { $in: gameIds } })
      .sort({ lastPlayedAt: -1 });

    // Get game-specific progress
    const gameProgress = progressRecords.map((record) => ({
      gameId: record.gameId._id.toString(),
      gameTitle: (record.gameId as any).title,
      playCount: record.playCount || 0,
      score: record.score || 0,
      timeSpent: record.timeSpent || 0, // in seconds
      isCompleted: record.isCompleted,
      completionPercentage: record.completionPercentage || 0,
      lastPlayedAt: record.lastPlayedAt,
    }));

    // Analyze health status
    const healthStatus = await this.analyzeStudentHealthInCourse(
      studentId,
      gameIds,
    );

    // Get recent activities (last 10)
    const recentActivities = progressRecords
      .sort((a, b) => {
        const dateA = a.lastPlayedAt?.getTime() || 0;
        const dateB = b.lastPlayedAt?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 10)
      .map((p) => ({
        gameId: p.gameId._id.toString(),
        gameTitle: (p.gameId as any).title,
        playedAt: p.lastPlayedAt,
        score: p.score,
        pointsEarned: p.pointsEarned,
        isCompleted: p.isCompleted,
      }));

    return {
      studentId: studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email,
      totalGamesPlayed,
      completedGames,
      totalPointsEarned,
      currentLevel: playerLevel?.currentLevel || 1,
      lastActive: lastProgress?.lastPlayedAt || student.lastLoginDate,
      gameProgress,
      recentActivities,
      healthStatus,
    };
  }

  /**
   * Get all courses and their students for a teacher
   */
  async getTeacherCourseDashboard(
    teacherId: string,
  ): Promise<
    Array<{
      courseId: string;
      courseName: string;
      courseCode: string;
      gameCount: number;
      studentCount: number;
      totalPointsDistributed: number;
      lastUpdated: Date;
    }>
  > {
    const courses = await this.courseModel
      .find({ teacherIds: new Types.ObjectId(teacherId), isActive: true })
      .populate('gameIds', 'title');

    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const gameIds = course.gameIds;

        // Get all students who played games in this course
        const studentIds = await this.progressModel
          .find({ gameId: { $in: gameIds } })
          .distinct('userId');

        // Calculate total points distributed
        const progressRecords = await this.progressModel.find({
          gameId: { $in: gameIds },
        });

        const totalPointsDistributed = progressRecords.reduce(
          (sum, p) => sum + (p.pointsEarned || 0),
          0,
        );

        return {
          courseId: course._id.toString(),
          courseName: course.name,
          courseCode: course.code,
          gameCount: gameIds.length,
          studentCount: studentIds.length,
          totalPointsDistributed,
          lastUpdated: (course as any).updatedAt,
        };
      }),
    );

    return courseStats;
  }

  /**
   * Get game activity in a course
   */
  async getCourseGameActivity(
    teacherId: string,
    courseId: string,
  ): Promise<any[]> {
    // Verify teacher is responsible for this course
    const course = await this.courseModel.findOne({
      _id: new Types.ObjectId(courseId),
      teacherIds: new Types.ObjectId(teacherId),
    });

    if (!course) {
      throw new NotFoundException(
        'Course not found or teacher is not responsible for this course',
      );
    }

    const gameIds = course.gameIds;

    // Get activity for each game
    const gameActivity = await Promise.all(
      gameIds.map(async (gameId) => {
        const game = await this.gameModel.findById(gameId);
        const progressRecords = await this.progressModel.find({
          gameId: new Types.ObjectId(gameId.toString()),
        });

        const totalPlays = progressRecords.length;
        const completedCount = progressRecords.filter(
          (p) => p.isCompleted,
        ).length;
        const avgScore =
          totalPlays > 0
            ? progressRecords.reduce((sum, p) => sum + (p.score || 0), 0) /
              totalPlays
            : 0;
        const avgTimeSpent =
          totalPlays > 0
            ? progressRecords.reduce((sum, p) => sum + (p.timeSpent || 0), 0) /
              totalPlays
            : 0;
        const totalPointsDistributed = progressRecords.reduce(
          (sum, p) => sum + (p.pointsEarned || 0),
          0,
        );

        return {
          gameId: gameId.toString(),
          gameTitle: game?.title,
          totalPlays,
          completedCount,
          completionRate:
            totalPlays > 0
              ? ((completedCount / totalPlays) * 100).toFixed(2) + '%'
              : '0%',
          avgScore: avgScore.toFixed(2),
          avgTimeSpent: Math.round(avgTimeSpent), // in seconds
          totalPointsDistributed,
        };
      }),
    );

    return gameActivity;
  }

  /**
   * Analyze student health in a specific course
   */
  private async analyzeStudentHealthInCourse(
    studentId: string,
    gameIds: Types.ObjectId[],
  ): Promise<'healthy' | 'concerning' | 'critical'> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Check recent activity in course games
    const recentProgress = await this.progressModel.findOne({
      userId: new Types.ObjectId(studentId),
      gameId: { $in: gameIds },
      lastPlayedAt: { $gte: threeDaysAgo },
    });

    // Check for cyberbullying incidents
    const incidents = await this.cyberbullyingIncidentModel.countDocuments({
      $or: [
        { reportedUserId: new Types.ObjectId(studentId) },
        { reporterId: new Types.ObjectId(studentId) },
      ],
      createdAt: { $gte: weekAgo },
      status: { $ne: 'resolved' },
    });

    if (incidents > 2) {
      return 'critical';
    }

    if (!recentProgress) {
      const lastActivity = await this.progressModel
        .findOne({
          userId: new Types.ObjectId(studentId),
          gameId: { $in: gameIds },
        })
        .sort({ lastPlayedAt: -1 });

      if (!lastActivity) {
        return 'concerning';
      }

      const daysSinceActivity = Math.floor(
        (now.getTime() - (lastActivity.lastPlayedAt || (lastActivity as any).updatedAt).getTime()) /
          (24 * 60 * 60 * 1000),
      );

      if (daysSinceActivity > 7) {
        return 'critical';
      }

      if (daysSinceActivity > 3) {
        return 'concerning';
      }
    }

    if (incidents > 0) {
      return 'concerning';
    }

    return 'healthy';
  }

  /**
   * Get filtered student activity by date range
   */
  async getCourseStudentActivityByDateRange(
    teacherId: string,
    courseId: string,
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CourseStudentActivity> {
    const course = await this.courseModel.findOne({
      _id: new Types.ObjectId(courseId),
      teacherIds: new Types.ObjectId(teacherId),
    });

    if (!course) {
      throw new NotFoundException(
        'Course not found or teacher is not responsible for this course',
      );
    }

    // Get student details
    const student = await this.userModel.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const gameIds = course.gameIds;
    if (gameIds.length === 0) {
      throw new BadRequestException('Course has no games assigned');
    }

    // Get progress records within date range
    const progressRecords = await this.progressModel.find({
      userId: new Types.ObjectId(studentId),
      gameId: { $in: gameIds },
      lastPlayedAt: { $gte: startDate, $lte: endDate },
    }).populate('gameId', 'title category difficulty pointsReward');

    // Calculate totals
    const totalGamesPlayed = progressRecords.length;
    const completedGames = progressRecords.filter((p) => p.isCompleted).length;
    const totalPointsEarned = progressRecords.reduce(
      (sum, p) => sum + (p.pointsEarned || 0),
      0,
    );

    const playerLevel = await this.playerLevelModel.findOne({
      userId: new Types.ObjectId(studentId),
    });

    const lastProgress = progressRecords.length > 0
      ? progressRecords.reduce((latest, current) =>
          (current.lastPlayedAt?.getTime() || 0) >
          (latest.lastPlayedAt?.getTime() || 0)
            ? current
            : latest,
        )
      : null;

    const gameProgress = progressRecords.map((record) => ({
      gameId: record.gameId._id.toString(),
      gameTitle: (record.gameId as any).title,
      playCount: record.playCount || 0,
      score: record.score || 0,
      timeSpent: record.timeSpent || 0,
      isCompleted: record.isCompleted,
      completionPercentage: record.completionPercentage || 0,
      lastPlayedAt: record.lastPlayedAt,
    }));

    const recentActivities = progressRecords
      .sort((a, b) => {
        const dateA = a.lastPlayedAt?.getTime() || 0;
        const dateB = b.lastPlayedAt?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 10)
      .map((p) => ({
        gameId: p.gameId._id.toString(),
        gameTitle: (p.gameId as any).title,
        playedAt: p.lastPlayedAt,
        score: p.score,
        pointsEarned: p.pointsEarned,
        isCompleted: p.isCompleted,
      }));

    const healthStatus = await this.analyzeStudentHealthInCourse(
      studentId,
      gameIds,
    );

    return {
      studentId: studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email,
      totalGamesPlayed,
      completedGames,
      totalPointsEarned,
      currentLevel: playerLevel?.currentLevel || 1,
      lastActive: lastProgress?.lastPlayedAt,
      gameProgress,
      recentActivities,
      healthStatus,
    };
  }

  /**
   * Get all games associated with a course
   */
  async getCourseGames(teacherId: string, courseId: string) {
    // Verify teacher is responsible for this course
    const course = await this.courseModel.findOne({
      _id: new Types.ObjectId(courseId),
      teacherIds: new Types.ObjectId(teacherId),
    }).populate('gameIds');

    if (!course) {
      throw new NotFoundException(
        'Course not found or teacher is not responsible for this course',
      );
    }

    return course.gameIds;
  }
}
