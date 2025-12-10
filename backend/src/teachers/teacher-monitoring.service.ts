import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TeacherAlert, TeacherAlertDocument } from '../schemas/teacher-alert.schema';
import { TeacherClass, TeacherClassDocument } from '../schemas/teacher-class.schema';
import { PlayerLevel, PlayerLevelDocument } from '../schemas/player-level.schema';
import { Progress, ProgressDocument } from '../schemas/progress.schema';
import { CyberbullyingIncident, CyberbullyingIncidentDocument } from '../schemas/cyberbullying-incident.schema';

@Injectable()
export class TeacherMonitoringService {
  private readonly logger = new Logger(TeacherMonitoringService.name);

  constructor(
    @InjectModel(TeacherAlert.name)
    private teacherAlertModel: Model<TeacherAlertDocument>,
    @InjectModel(TeacherClass.name)
    private teacherClassModel: Model<TeacherClassDocument>,
    @InjectModel(PlayerLevel.name)
    private playerLevelModel: Model<PlayerLevelDocument>,
    @InjectModel(Progress.name)
    private progressModel: Model<ProgressDocument>,
    @InjectModel(CyberbullyingIncident.name)
    private cyberbullyingIncidentModel: Model<CyberbullyingIncidentDocument>,
  ) {}

  /**
   * Create alert for teacher
   */
  async createAlert(alertData: {
    teacherId: string;
    classId?: string;
    studentId?: string;
    alertType: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    metadata?: any;
  }): Promise<TeacherAlertDocument> {
    const alert = new this.teacherAlertModel({
      ...alertData,
      teacherId: new Types.ObjectId(alertData.teacherId),
      classId: alertData.classId ? new Types.ObjectId(alertData.classId) : undefined,
      studentId: alertData.studentId ? new Types.ObjectId(alertData.studentId) : undefined,
    });

    await alert.save();
    this.logger.log(`Alert created: ${alertData.alertType} for teacher ${alertData.teacherId}`);

    return alert;
  }

  /**
   * Get unread alerts for teacher
   */
  async getUnreadAlerts(teacherId: string, limit?: number): Promise<TeacherAlertDocument[]> {
    const query = this.teacherAlertModel
      .find({
        teacherId: new Types.ObjectId(teacherId),
        isRead: false,
      })
      .sort({ priority: -1, createdAt: -1 })
      .populate('studentId', 'fullName username');

    if (limit) {
      query.limit(limit);
    }

    return query.exec();
  }

  /**
   * Get all alerts for teacher (filtered)
   */
  async getAlerts(
    teacherId: string,
    filters?: {
      classId?: string;
      studentId?: string;
      alertType?: string;
      priority?: string;
      isRead?: boolean;
      isResolved?: boolean;
    },
    limit: number = 50,
  ): Promise<TeacherAlertDocument[]> {
    const query: any = { teacherId: new Types.ObjectId(teacherId) };

    if (filters?.classId) query.classId = new Types.ObjectId(filters.classId);
    if (filters?.studentId) query.studentId = new Types.ObjectId(filters.studentId);
    if (filters?.alertType) query.alertType = filters.alertType;
    if (filters?.priority) query.priority = filters.priority;
    if (filters?.isRead !== undefined) query.isRead = filters.isRead;
    if (filters?.isResolved !== undefined) query.isResolved = filters.isResolved;

    return this.teacherAlertModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('studentId', 'fullName username')
      .exec();
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(teacherId: string, alertId: string): Promise<TeacherAlertDocument> {
    const alert = await this.teacherAlertModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(alertId),
        teacherId: new Types.ObjectId(teacherId),
      },
      {
        $set: { isRead: true, readAt: new Date() },
      },
      { new: true },
    );

    return alert;
  }

  /**
   * Mark multiple alerts as read
   */
  async markAlertsAsRead(teacherId: string, alertIds: string[]): Promise<number> {
    const result = await this.teacherAlertModel.updateMany(
      {
        _id: { $in: alertIds.map((id) => new Types.ObjectId(id)) },
        teacherId: new Types.ObjectId(teacherId),
      },
      {
        $set: { isRead: true, readAt: new Date() },
      },
    );

    return result.modifiedCount;
  }

  /**
   * Resolve alert
   */
  async resolveAlert(
    teacherId: string,
    alertId: string,
    resolutionNotes?: string,
  ): Promise<TeacherAlertDocument> {
    const alert = await this.teacherAlertModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(alertId),
        teacherId: new Types.ObjectId(teacherId),
      },
      {
        $set: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy: new Types.ObjectId(teacherId),
          resolutionNotes,
        },
      },
      { new: true },
    );

    this.logger.log(`Alert ${alertId} resolved by teacher ${teacherId}`);

    return alert;
  }

  /**
   * Automated monitoring - Check for low engagement (runs daily)
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async checkLowEngagement(): Promise<void> {
    this.logger.log('Running automated low engagement check');

    const classes = await this.teacherClassModel.find({ isActive: true });

    for (const classDoc of classes) {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      for (const studentId of classDoc.students) {
        // Check if student has any activity in last 3 days
        const recentActivity = await this.progressModel.findOne({
          userId: studentId,
          completedAt: { $gte: threeDaysAgo },
        });

        if (!recentActivity) {
          // Check if alert already exists
          const existingAlert = await this.teacherAlertModel.findOne({
            teacherId: classDoc.teacherId,
            studentId,
            alertType: 'low_engagement',
            isResolved: false,
            createdAt: { $gte: threeDaysAgo },
          });

          if (!existingAlert) {
            await this.createAlert({
              teacherId: classDoc.teacherId.toString(),
              classId: classDoc._id.toString(),
              studentId: studentId.toString(),
              alertType: 'low_engagement',
              priority: 'medium',
              title: 'Student has low engagement',
              message: `Student hasn't played any games in the last 3 days`,
              metadata: { daysSinceActivity: 3 },
            });
          }
        }
      }
    }

    this.logger.log('Low engagement check completed');
  }

  /**
   * Check for struggling students (runs daily)
   */
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async checkStrugglingStudents(): Promise<void> {
    this.logger.log('Running automated struggling students check');

    const classes = await this.teacherClassModel.find({ isActive: true });

    for (const classDoc of classes) {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      for (const studentId of classDoc.students) {
        // Check recent scores
        const recentGames = await this.progressModel
          .find({
            userId: studentId,
            completedAt: { $gte: weekAgo },
          })
          .sort({ completedAt: -1 })
          .limit(5);

        if (recentGames.length >= 3) {
          const avgScore =
            recentGames.reduce((sum, g) => sum + (g.score || 0), 0) / recentGames.length;

          // If average score is below 50%
          if (avgScore < 50) {
            const existingAlert = await this.teacherAlertModel.findOne({
              teacherId: classDoc.teacherId,
              studentId,
              alertType: 'struggling_student',
              isResolved: false,
              createdAt: { $gte: weekAgo },
            });

            if (!existingAlert) {
              await this.createAlert({
                teacherId: classDoc.teacherId.toString(),
                classId: classDoc._id.toString(),
                studentId: studentId.toString(),
                alertType: 'struggling_student',
                priority: 'high',
                title: 'Student is struggling',
                message: `Student's average score over last ${recentGames.length} games is ${avgScore.toFixed(1)}%`,
                metadata: { averageScore: avgScore, gamesPlayed: recentGames.length },
              });
            }
          }
        }
      }
    }

    this.logger.log('Struggling students check completed');
  }

  /**
   * Monitor for rapid progress (potential gifted students)
   */
  async checkRapidProgress(studentId: string, teacherId: string, classId: string): Promise<void> {
    const playerLevel = await this.playerLevelModel.findOne({
      userId: new Types.ObjectId(studentId),
    });

    if (!playerLevel) return;

    // If student reached level 5+ in less than 4 weeks
    const accountAge = Date.now() - playerLevel['createdAt'].getTime();
    const weeksSinceStart = accountAge / (7 * 24 * 60 * 60 * 1000);

    if (playerLevel.currentLevel >= 5 && weeksSinceStart < 4) {
      const existingAlert = await this.teacherAlertModel.findOne({
        teacherId: new Types.ObjectId(teacherId),
        studentId: new Types.ObjectId(studentId),
        alertType: 'rapid_progress',
        isResolved: false,
      });

      if (!existingAlert) {
        await this.createAlert({
          teacherId,
          classId,
          studentId,
          alertType: 'rapid_progress',
          priority: 'low',
          title: 'Student showing rapid progress',
          message: `Student reached Level ${playerLevel.currentLevel} in ${weeksSinceStart.toFixed(1)} weeks`,
          metadata: {
            currentLevel: playerLevel.currentLevel,
            weeksSinceStart: weeksSinceStart.toFixed(1),
          },
        });
      }
    }
  }

  /**
   * Alert when cyberbullying incident occurs
   */
  async alertCyberbullyingIncident(
    teacherId: string,
    classId: string,
    incidentId: string,
  ): Promise<void> {
    const incident = await this.cyberbullyingIncidentModel.findById(incidentId);

    if (!incident) return;

    await this.createAlert({
      teacherId,
      classId,
      studentId: incident.victimStudentId?.toString() || incident.reportedStudentId?.toString(),
      alertType: 'cyberbullying_incident',
      priority: incident.severity === 'high' ? 'critical' : 'high',
      title: 'Cyberbullying incident reported',
      message: `${incident.incidentType} incident detected. Severity: ${incident.severity}`,
      metadata: {
        incidentId: incident._id.toString(),
        incidentType: incident.incidentType,
        severity: incident.severity,
      },
    });
  }

  /**
   * Alert when student shows distress patterns
   */
  async alertDistressPattern(
    teacherId: string,
    classId: string,
    studentId: string,
    pattern: string,
  ): Promise<void> {
    await this.createAlert({
      teacherId,
      classId,
      studentId,
      alertType: 'distress_pattern',
      priority: 'high',
      title: 'Student showing distress pattern',
      message: `Behavioral anomaly detected: ${pattern}`,
      metadata: { pattern },
    });
  }

  /**
   * Alert when student levels up (celebration)
   */
  async alertLevelUp(
    teacherId: string,
    classId: string,
    studentId: string,
    newLevel: number,
  ): Promise<void> {
    await this.createAlert({
      teacherId,
      classId,
      studentId,
      alertType: 'level_up',
      priority: 'low',
      title: 'Student leveled up!',
      message: `Student reached Level ${newLevel}`,
      metadata: { newLevel },
    });
  }

  /**
   * Alert when student earns achievement milestone
   */
  async alertAchievementMilestone(
    teacherId: string,
    classId: string,
    studentId: string,
    achievementCount: number,
  ): Promise<void> {
    // Only alert at milestones (5, 10, 20, etc.)
    if ([5, 10, 15, 20, 25, 30].includes(achievementCount)) {
      await this.createAlert({
        teacherId,
        classId,
        studentId,
        alertType: 'achievement_milestone',
        priority: 'low',
        title: 'Achievement milestone reached',
        message: `Student has earned ${achievementCount} achievements!`,
        metadata: { achievementCount },
      });
    }
  }

  /**
   * Get alert statistics for teacher
   */
  async getAlertStatistics(teacherId: string): Promise<{
    total: number;
    unread: number;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const alerts = await this.teacherAlertModel.find({
      teacherId: new Types.ObjectId(teacherId),
      isResolved: false,
    });

    const unread = alerts.filter((a) => !a.isRead).length;

    const byPriority: Record<string, number> = {};
    const byType: Record<string, number> = {};

    alerts.forEach((alert) => {
      byPriority[alert.priority] = (byPriority[alert.priority] || 0) + 1;
      byType[alert.alertType] = (byType[alert.alertType] || 0) + 1;
    });

    return {
      total: alerts.length,
      unread,
      byPriority,
      byType,
    };
  }
}
