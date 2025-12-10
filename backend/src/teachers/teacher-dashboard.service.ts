import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TeacherClass, TeacherClassDocument } from '../schemas/teacher-class.schema';
import { TeacherAlert, TeacherAlertDocument } from '../schemas/teacher-alert.schema';
import { TeacherNote, TeacherNoteDocument } from '../schemas/teacher-note.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { PlayerLevel, PlayerLevelDocument } from '../schemas/player-level.schema';
import { Progress, ProgressDocument } from '../schemas/progress.schema';
import { CyberbullyingIncident, CyberbullyingIncidentDocument } from '../schemas/cyberbullying-incident.schema';

export interface ClassOverview {
  classInfo: {
    id: string;
    name: string;
    grade: string;
    subject: string;
    studentCount: number;
  };
  activitySummary: {
    activeToday: number;
    activeThisWeek: number;
    achievementsEarnedThisWeek: number;
    levelUpsThisWeek: number;
  };
  alerts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    unread: number;
  };
  studentHealth: {
    healthy: number; // Green
    concerning: number; // Yellow
    critical: number; // Red
  };
}

export interface StudentStatus {
  studentId: string;
  name: string;
  email: string;
  status: 'healthy' | 'concerning' | 'critical';
  statusReason: string;
  currentLevel: number;
  totalXP: number;
  lastActive: Date;
  todayXP: number;
  achievementsCount: number;
  recentAlerts: any[];
}

interface DashboardData {
  overview: ClassOverview;
  students: StudentStatus[];
  recentActivity: any[];
  recentAlerts: any[];
}

@Injectable()
export class TeacherDashboardService {
  private readonly logger = new Logger(TeacherDashboardService.name);

  constructor(
    @InjectModel(TeacherClass.name)
    private teacherClassModel: Model<TeacherClassDocument>,
    @InjectModel(TeacherAlert.name)
    private teacherAlertModel: Model<TeacherAlertDocument>,
    @InjectModel(TeacherNote.name)
    private teacherNoteModel: Model<TeacherNoteDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(PlayerLevel.name)
    private playerLevelModel: Model<PlayerLevelDocument>,
    @InjectModel(Progress.name)
    private progressModel: Model<ProgressDocument>,
    @InjectModel(CyberbullyingIncident.name)
    private cyberbullyingIncidentModel: Model<CyberbullyingIncidentDocument>,
  ) {}

  /**
   * Get teacher's main dashboard with all classes
   */
  async getTeacherDashboard(teacherId: string): Promise<{
    classes: ClassOverview[];
    totalStudents: number;
    totalAlerts: number;
    recentActivity: any[];
  }> {
    const classes = await this.teacherClassModel
      .find({ teacherId: new Types.ObjectId(teacherId), isActive: true })
      .populate('students');

    const classOverviews = await Promise.all(
      classes.map((cls) => this.getClassOverview(teacherId, cls._id.toString())),
    );

    const totalStudents = classOverviews.reduce(
      (sum, cls) => sum + cls.classInfo.studentCount,
      0,
    );

    const totalAlerts = classOverviews.reduce(
      (sum, cls) => sum + cls.alerts.unread,
      0,
    );

    // Get recent activity across all classes
    const recentActivity = await this.getRecentActivityForTeacher(teacherId);

    return {
      classes: classOverviews,
      totalStudents,
      totalAlerts,
      recentActivity,
    };
  }

  /**
   * Get detailed overview for a specific class
   */
  async getClassOverview(teacherId: string, classId: string): Promise<ClassOverview> {
    const classDoc = await this.teacherClassModel
      .findOne({
        _id: new Types.ObjectId(classId),
        teacherId: new Types.ObjectId(teacherId),
      })
      .populate('students');

    if (!classDoc) {
      throw new NotFoundException('Class not found');
    }

    const studentIds = classDoc.students.map((s) => new Types.ObjectId(s.toString()));

    // Activity Summary
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeToday = await this.progressModel.countDocuments({
      userId: { $in: studentIds },
      completedAt: { $gte: todayStart },
    });

    const activeThisWeek = await this.progressModel.countDocuments({
      userId: { $in: studentIds },
      completedAt: { $gte: weekStart },
    });

    // Get level-ups this week
    const levelUpsThisWeek = await this.playerLevelModel.aggregate([
      { $match: { userId: { $in: studentIds } } },
      { $unwind: '$levelUpHistory' },
      { $match: { 'levelUpHistory.achievedAt': { $gte: weekStart } } },
      { $count: 'count' },
    ]);

    // Get alerts breakdown
    const alertCounts = await this.teacherAlertModel.aggregate([
      {
        $match: {
          teacherId: new Types.ObjectId(teacherId),
          classId: new Types.ObjectId(classId),
          isResolved: false,
        },
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const alertsMap = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    alertCounts.forEach((item) => {
      alertsMap[item._id] = item.count;
    });

    const unreadAlerts = await this.teacherAlertModel.countDocuments({
      teacherId: new Types.ObjectId(teacherId),
      classId: new Types.ObjectId(classId),
      isRead: false,
    });

    // Student Health Analysis
    const studentHealth = await this.analyzeClassHealth(studentIds);

    return {
      classInfo: {
        id: classDoc._id.toString(),
        name: classDoc.className,
        grade: classDoc.grade,
        subject: classDoc.subject,
        studentCount: studentIds.length,
      },
      activitySummary: {
        activeToday,
        activeThisWeek,
        achievementsEarnedThisWeek: 0, // TODO: implement when achievements ready
        levelUpsThisWeek: levelUpsThisWeek.length > 0 ? levelUpsThisWeek[0].count : 0,
      },
      alerts: {
        ...alertsMap,
        unread: unreadAlerts,
      },
      studentHealth,
    };
  }

  /**
   * Analyze health status of all students in class
   */
  private async analyzeClassHealth(
    studentIds: Types.ObjectId[],
  ): Promise<{ healthy: number; concerning: number; critical: number }> {
    const students = await Promise.all(
      studentIds.map((id) => this.analyzeStudentHealth(id.toString())),
    );

    return {
      healthy: students.filter((s) => s.status === 'healthy').length,
      concerning: students.filter((s) => s.status === 'concerning').length,
      critical: students.filter((s) => s.status === 'critical').length,
    };
  }

  /**
   * Analyze individual student health
   */
  async analyzeStudentHealth(
    studentId: string,
  ): Promise<{ status: 'healthy' | 'concerning' | 'critical'; reason: string }> {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Check recent activity
    const recentProgress = await this.progressModel.findOne({
      userId: new Types.ObjectId(studentId),
      completedAt: { $gte: threeDaysAgo },
    });

    // Check for cyberbullying incidents
    const recentIncidents = await this.cyberbullyingIncidentModel.countDocuments({
      $or: [
        { reportedUserId: new Types.ObjectId(studentId) },
        { reporterId: new Types.ObjectId(studentId) },
      ],
      createdAt: { $gte: weekAgo },
      status: { $ne: 'resolved' },
    });

    // Check for behavioral concerns
    const playerLevel = await this.playerLevelModel.findOne({
      userId: new Types.ObjectId(studentId),
    });

    // Critical conditions
    if (recentIncidents > 2) {
      return { status: 'critical', reason: 'Multiple cyberbullying incidents' };
    }

    if (!recentProgress) {
      const lastActivity = await this.progressModel
        .findOne({ userId: new Types.ObjectId(studentId) })
        .sort({ completedAt: -1 });

      if (!lastActivity) {
        return { status: 'concerning', reason: 'No activity recorded' };
      }

      const daysSinceActivity = Math.floor(
        (now.getTime() - (lastActivity.lastPlayedAt || lastActivity['updatedAt']).getTime()) / (24 * 60 * 60 * 1000),
      );

      if (daysSinceActivity > 7) {
        return { status: 'critical', reason: `No activity for ${daysSinceActivity} days` };
      }

      if (daysSinceActivity > 3) {
        return { status: 'concerning', reason: `No activity for ${daysSinceActivity} days` };
      }
    }

    // Concerning conditions
    if (recentIncidents > 0) {
      return { status: 'concerning', reason: 'Recent cyberbullying incident' };
    }

    // Healthy
    return { status: 'healthy', reason: 'Active and engaged' };
  }

  /**
   * Get detailed student list for a class
   */
  async getClassStudentList(teacherId: string, classId: string): Promise<StudentStatus[]> {
    const classDoc = await this.teacherClassModel.findOne({
      _id: new Types.ObjectId(classId),
      teacherId: new Types.ObjectId(teacherId),
    });

    if (!classDoc) {
      throw new NotFoundException('Class not found');
    }

    const students = await Promise.all(
      classDoc.students.map((studentId) =>
        this.getStudentStatus(teacherId, studentId.toString()),
      ),
    );

    return students;
  }

  /**
   * Get detailed status for individual student
   */
  async getStudentStatus(teacherId: string, studentId: string): Promise<StudentStatus> {
    const user = await this.userModel.findById(studentId);
    if (!user) {
      throw new NotFoundException('Student not found');
    }

    const playerLevel = await this.playerLevelModel.findOne({
      userId: new Types.ObjectId(studentId),
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayProgress = await this.progressModel.find({
      userId: new Types.ObjectId(studentId),
      completedAt: { $gte: todayStart },
    });

    const todayXP = todayProgress.reduce((sum, p) => sum + (p.pointsEarned || 0), 0);

    const lastActivity = await this.progressModel
      .findOne({ userId: new Types.ObjectId(studentId) })
      .sort({ completedAt: -1 });

    const healthAnalysis = await this.analyzeStudentHealth(studentId);

    const recentAlerts = await this.teacherAlertModel
      .find({
        teacherId: new Types.ObjectId(teacherId),
        studentId: new Types.ObjectId(studentId),
        isResolved: false,
      })
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      studentId: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      status: healthAnalysis.status,
      statusReason: healthAnalysis.reason,
      currentLevel: playerLevel?.currentLevel || 1,
      totalXP: playerLevel?.totalXPEarned || 0,
      lastActive: lastActivity?.lastPlayedAt || lastActivity?.['updatedAt'] || user['createdAt'],
      todayXP,
      achievementsCount: 0, // TODO: implement when achievements ready
      recentAlerts: recentAlerts.map((alert) => ({
        type: alert.alertType,
        priority: alert.priority,
        title: alert.title,
        createdAt: alert['createdAt'],
      })),
    };
  }

  /**
   * Get recent activity feed for teacher
   */
  /**
   * Get recent activity feed for teacher
   */
  async getRecentActivityForTeacher(teacherId: string, limit: number = 20): Promise<any[]> {
    const classes = await this.teacherClassModel.find({
      teacherId: new Types.ObjectId(teacherId),
      isActive: true,
    });

    const studentIds = classes.flatMap((cls) => cls.students);

    const recentProgress = await this.progressModel
      .find({ userId: { $in: studentIds } })
      .sort({ completedAt: -1 })
      .limit(limit)
      .populate('userId', 'fullName username')
      .populate('gameId', 'title');

    return recentProgress.map((p) => ({
      type: 'game_completed',
      student: {
        id: p.userId,
        name: (p.userId as any).fullName || (p.userId as any).username,
      },
      game: {
        id: p.gameId,
        title: (p.gameId as any).title,
      },
      score: p.score,
      pointsEarned: p.pointsEarned,
      completedAt: p.lastPlayedAt || p['updatedAt'],
    }));
  }

  /**
   * Create or update class
   */
  async createClass(
    teacherId: string,
    classData: {
      className: string;
      grade?: string;
      subject?: string;
      academicYear?: string;
      description?: string;
      settings?: {
        enableLeaderboard?: boolean;
        enablePeerTutoring?: boolean;
        allowParentMessaging?: boolean;
        strictCyberbullyingMode?: boolean;
      };
    },
  ): Promise<TeacherClassDocument> {
    const newClass = new this.teacherClassModel({
      teacherId: new Types.ObjectId(teacherId),
      ...classData,
      students: [],
    });

    await newClass.save();
    this.logger.log(`Class created: ${classData.className} by teacher ${teacherId}`);

    return newClass;
  }

  /**
   * Add students to class
   */
  async addStudentsToClass(
    teacherId: string,
    classId: string,
    studentIds: string[],
  ): Promise<TeacherClassDocument> {
    const classDoc = await this.teacherClassModel.findOne({
      _id: new Types.ObjectId(classId),
      teacherId: new Types.ObjectId(teacherId),
    });

    if (!classDoc) {
      throw new NotFoundException('Class not found');
    }

    const studentObjectIds = studentIds.map((id) => new Types.ObjectId(id));

    // Add only new students
    const existingIds = classDoc.students.map((s) => s.toString());
    const newStudents = studentObjectIds.filter((id) => !existingIds.includes(id.toString()));

    classDoc.students.push(...newStudents);
    await classDoc.save();

    this.logger.log(`Added ${newStudents.length} students to class ${classId}`);

    return classDoc;
  }

  /**
   * Remove student from class
   */
  async removeStudentFromClass(
    teacherId: string,
    classId: string,
    studentId: string,
  ): Promise<TeacherClassDocument> {
    const classDoc = await this.teacherClassModel.findOne({
      _id: new Types.ObjectId(classId),
      teacherId: new Types.ObjectId(teacherId),
    });

    if (!classDoc) {
      throw new NotFoundException('Class not found');
    }

    classDoc.students = classDoc.students.filter((s) => s.toString() !== studentId);
    await classDoc.save();

    this.logger.log(`Removed student ${studentId} from class ${classId}`);

    return classDoc;
  }

  /**
   * Update class settings
   */
  async updateClassSettings(
    teacherId: string,
    classId: string,
    settings: any,
  ): Promise<TeacherClassDocument> {
    const classDoc = await this.teacherClassModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(classId),
        teacherId: new Types.ObjectId(teacherId),
      },
      { $set: { settings } },
      { new: true },
    );

    if (!classDoc) {
      throw new NotFoundException('Class not found');
    }

    return classDoc;
  }

  /**
   * Get teacher's classes
   */
  async getTeacherClasses(teacherId: string): Promise<TeacherClassDocument[]> {
    return this.teacherClassModel
      .find({ teacherId: new Types.ObjectId(teacherId), isActive: true })
      .populate('students', 'fullName username email');
  }
}
