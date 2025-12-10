import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { PlayerLevel, PlayerLevelDocument } from '../schemas/player-level.schema';
import { Progress, ProgressDocument } from '../schemas/progress.schema';
import { TeacherClass, TeacherClassDocument } from '../schemas/teacher-class.schema';
import { TeacherAlert, TeacherAlertDocument } from '../schemas/teacher-alert.schema';

export interface ClassReport {
  classInfo: {
    name: string;
    grade: string;
    subject: string;
    studentCount: number;
  };
  periodSummary: {
    startDate: Date;
    endDate: Date;
    totalGamesPlayed: number;
    averageClassScore: number;
    totalXpEarned: number;
    totalLevelUps: number;
  };
  studentPerformance: Array<{
    studentId: string;
    studentName: string;
    gamesPlayed: number;
    averageScore: number;
    xpEarned: number;
    currentLevel: number;
    performance: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  }>;
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    metric: string;
    value: number;
  }>;
  concerningStudents: Array<{
    studentId: string;
    studentName: string;
    concerns: string[];
  }>;
  insights: string[];
}

@Injectable()
export class ReportGenerationService {
  private readonly logger = new Logger(ReportGenerationService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(PlayerLevel.name)
    private playerLevelModel: Model<PlayerLevelDocument>,
    @InjectModel(Progress.name)
    private progressModel: Model<ProgressDocument>,
    @InjectModel(TeacherClass.name)
    private teacherClassModel: Model<TeacherClassDocument>,
    @InjectModel(TeacherAlert.name)
    private teacherAlertModel: Model<TeacherAlertDocument>,
  ) {}

  /**
   * Generate weekly class report
   */
  async generateWeeklyClassReport(
    teacherId: string,
    classId: string,
  ): Promise<ClassReport> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.generateClassReport(teacherId, classId, weekAgo, new Date());
  }

  /**
   * Generate monthly class report
   */
  async generateMonthlyClassReport(
    teacherId: string,
    classId: string,
  ): Promise<ClassReport> {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return this.generateClassReport(teacherId, classId, monthAgo, new Date());
  }

  /**
   * Generate custom date range report
   */
  async generateCustomClassReport(
    teacherId: string,
    classId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ClassReport> {
    return this.generateClassReport(teacherId, classId, startDate, endDate);
  }

  /**
   * Core report generation logic
   */
  private async generateClassReport(
    teacherId: string,
    classId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ClassReport> {
    // Verify class ownership
    const teacherClass = await this.teacherClassModel.findOne({
      _id: new Types.ObjectId(classId),
      teacherId: new Types.ObjectId(teacherId),
    });

    if (!teacherClass) {
      throw new Error('Class not found or unauthorized');
    }

    const studentIds = teacherClass.students.map((id) => new Types.ObjectId(id));

    // Get all progress for period
    const periodProgress = await this.progressModel.find({
      userId: { $in: studentIds },
      completedAt: { $gte: startDate, $lte: endDate },
    });

    // Calculate class-wide metrics
    const totalGamesPlayed = periodProgress.length;
    const averageClassScore =
      totalGamesPlayed > 0
        ? periodProgress.reduce((sum, p) => sum + (p.score || 0), 0) /
          totalGamesPlayed
        : 0;
    const totalXpEarned = periodProgress.reduce(
      (sum, p) => sum + (p.pointsEarned || 0),
      0,
    );

    // Get level-up count
    const playerLevels = await this.playerLevelModel.find({
      userId: { $in: studentIds },
    });
    const totalLevelUps = playerLevels.reduce(
      (sum, pl) =>
        sum +
        Object.values(pl.levelUpHistory).filter(
          (achievedAt: Date) => achievedAt >= startDate && achievedAt <= endDate,
        ).length,
      0,
    );

    // Build student performance data
    const studentPerformance = await Promise.all(
      studentIds.map(async (studentId) => {
        const student = await this.userModel.findById(studentId);
        const studentProgress = periodProgress.filter(
          (p) => p.userId.toString() === studentId.toString(),
        );
        const gamesPlayed = studentProgress.length;
        const averageScore =
          gamesPlayed > 0
            ? studentProgress.reduce((sum, p) => sum + (p.score || 0), 0) /
              gamesPlayed
            : 0;
        const xpEarned = studentProgress.reduce(
          (sum, p) => sum + (p.pointsEarned || 0),
          0,
        );

        const playerLevel = await this.playerLevelModel.findOne({
          userId: studentId,
        });

        // Determine performance level
        let performance: 'excellent' | 'good' | 'fair' | 'needs_improvement';
        if (averageScore >= 80 && gamesPlayed >= 5) {
          performance = 'excellent';
        } else if (averageScore >= 65 && gamesPlayed >= 3) {
          performance = 'good';
        } else if (averageScore >= 50 || gamesPlayed >= 1) {
          performance = 'fair';
        } else {
          performance = 'needs_improvement';
        }

        return {
          studentId: studentId.toString(),
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          gamesPlayed,
          averageScore: parseFloat(averageScore.toFixed(1)),
          xpEarned,
          currentLevel: playerLevel?.currentLevel || 1,
          performance,
        };
      }),
    );

    // Identify top performers
    const topPerformers = [
      {
        studentId: studentPerformance.sort((a, b) => b.averageScore - a.averageScore)[0]
          ?.studentId,
        studentName: studentPerformance.sort(
          (a, b) => b.averageScore - a.averageScore,
        )[0]?.studentName,
        metric: 'Highest Average Score',
        value: studentPerformance[0]?.averageScore || 0,
      },
      {
        studentId: studentPerformance.sort((a, b) => b.gamesPlayed - a.gamesPlayed)[0]
          ?.studentId,
        studentName: studentPerformance.sort(
          (a, b) => b.gamesPlayed - a.gamesPlayed,
        )[0]?.studentName,
        metric: 'Most Games Played',
        value: studentPerformance.sort((a, b) => b.gamesPlayed - a.gamesPlayed)[0]
          ?.gamesPlayed || 0,
      },
      {
        studentId: studentPerformance.sort((a, b) => b.xpEarned - a.xpEarned)[0]
          ?.studentId,
        studentName: studentPerformance.sort((a, b) => b.xpEarned - a.xpEarned)[0]
          ?.studentName,
        metric: 'Most XP Earned',
        value: studentPerformance.sort((a, b) => b.xpEarned - a.xpEarned)[0]
          ?.xpEarned || 0,
      },
    ].filter((p) => p.studentId); // Remove nulls

    // Identify concerning students
    const concerningStudents = await Promise.all(
      studentPerformance
        .filter((sp) => sp.performance === 'needs_improvement')
        .map(async (sp) => {
          const concerns: string[] = [];

          if (sp.gamesPlayed === 0) {
            concerns.push('No games played this period');
          } else if (sp.gamesPlayed < 2) {
            concerns.push('Very low engagement');
          }

          if (sp.averageScore < 50 && sp.gamesPlayed > 0) {
            concerns.push('Low average score - may need support');
          }

          // Check for alerts
          const alerts = await this.teacherAlertModel.find({
            teacherId: new Types.ObjectId(teacherId),
            studentId: new Types.ObjectId(sp.studentId),
            createdAt: { $gte: startDate, $lte: endDate },
            isResolved: false,
          });

          if (alerts.length > 0) {
            concerns.push(`${alerts.length} unresolved alert(s)`);
          }

          return {
            studentId: sp.studentId,
            studentName: sp.studentName,
            concerns,
          };
        }),
    );

    // Generate insights
    const insights: string[] = [];

    const excellentCount = studentPerformance.filter(
      (sp) => sp.performance === 'excellent',
    ).length;
    const needsImprovementCount = studentPerformance.filter(
      (sp) => sp.performance === 'needs_improvement',
    ).length;

    if (excellentCount > studentPerformance.length * 0.5) {
      insights.push(
        `Strong class performance: ${excellentCount} students performing excellently`,
      );
    }

    if (averageClassScore >= 75) {
      insights.push(
        `Class average of ${averageClassScore.toFixed(1)}% shows good understanding`,
      );
    } else if (averageClassScore < 60) {
      insights.push(
        `Class average of ${averageClassScore.toFixed(1)}% suggests need for review`,
      );
    }

    if (totalGamesPlayed / studentIds.length < 3) {
      insights.push(
        'Low engagement overall - consider strategies to increase participation',
      );
    } else if (totalGamesPlayed / studentIds.length > 10) {
      insights.push('Excellent engagement levels across the class');
    }

    if (needsImprovementCount > studentPerformance.length * 0.25) {
      insights.push(
        `${needsImprovementCount} students need additional support or intervention`,
      );
    }

    if (totalLevelUps > studentIds.length * 0.5) {
      insights.push(
        `Great progress: ${totalLevelUps} level-ups achieved this period`,
      );
    }

    return {
      classInfo: {
        name: teacherClass.className,
        grade: teacherClass.grade,
        subject: teacherClass.subject,
        studentCount: studentIds.length,
      },
      periodSummary: {
        startDate,
        endDate,
        totalGamesPlayed,
        averageClassScore: parseFloat(averageClassScore.toFixed(1)),
        totalXpEarned,
        totalLevelUps,
      },
      studentPerformance: studentPerformance.sort(
        (a, b) => b.averageScore - a.averageScore,
      ),
      topPerformers,
      concerningStudents: concerningStudents.filter((cs) => cs.concerns.length > 0),
      insights,
    };
  }

  /**
   * Generate formatted HTML report
   */
  async generateHtmlReport(
    teacherId: string,
    classId: string,
    reportType: 'weekly' | 'monthly',
  ): Promise<string> {
    const report =
      reportType === 'weekly'
        ? await this.generateWeeklyClassReport(teacherId, classId)
        : await this.generateMonthlyClassReport(teacherId, classId);

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #4CAF50; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            tr:hover { background: #f5f5f5; }
            .metric { background: #e8f5e9; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .insight { background: #fff3cd; padding: 10px; margin: 5px 0; border-left: 4px solid #ffc107; }
            .concern { background: #f8d7da; padding: 10px; margin: 5px 0; border-left: 4px solid #dc3545; }
            .excellent { color: #28a745; font-weight: bold; }
            .good { color: #17a2b8; }
            .fair { color: #ffc107; }
            .needs_improvement { color: #dc3545; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${report.classInfo.name} - ${reportType === 'weekly' ? 'Weekly' : 'Monthly'} Report</h1>
          
          <div class="metric">
            <h3>Class Information</h3>
            <p><strong>Grade:</strong> ${report.classInfo.grade}</p>
            <p><strong>Subject:</strong> ${report.classInfo.subject}</p>
            <p><strong>Students:</strong> ${report.classInfo.studentCount}</p>
            <p><strong>Period:</strong> ${report.periodSummary.startDate.toLocaleDateString()} - ${report.periodSummary.endDate.toLocaleDateString()}</p>
          </div>

          <h2>📊 Period Summary</h2>
          <div class="metric">
            <p><strong>Total Games Played:</strong> ${report.periodSummary.totalGamesPlayed}</p>
            <p><strong>Average Class Score:</strong> ${report.periodSummary.averageClassScore}%</p>
            <p><strong>Total XP Earned:</strong> ${report.periodSummary.totalXpEarned}</p>
            <p><strong>Total Level-Ups:</strong> ${report.periodSummary.totalLevelUps}</p>
          </div>

          ${report.insights.length > 0 ? `
            <h2>💡 Key Insights</h2>
            ${report.insights.map((i) => `<div class="insight">${i}</div>`).join('')}
          ` : ''}

          ${report.topPerformers.length > 0 ? `
            <h2>🌟 Top Performers</h2>
            <table>
              <tr>
                <th>Student</th>
                <th>Achievement</th>
                <th>Value</th>
              </tr>
              ${report.topPerformers.map((tp) => `
                <tr>
                  <td>${tp.studentName}</td>
                  <td>${tp.metric}</td>
                  <td>${tp.value}</td>
                </tr>
              `).join('')}
            </table>
          ` : ''}

          <h2>📈 Student Performance</h2>
          <table>
            <tr>
              <th>Student</th>
              <th>Games Played</th>
              <th>Avg Score</th>
              <th>XP Earned</th>
              <th>Current Level</th>
              <th>Status</th>
            </tr>
            ${report.studentPerformance.map((sp) => `
              <tr>
                <td>${sp.studentName}</td>
                <td>${sp.gamesPlayed}</td>
                <td>${sp.averageScore}%</td>
                <td>${sp.xpEarned}</td>
                <td>${sp.currentLevel}</td>
                <td class="${sp.performance}">${sp.performance.replace('_', ' ').toUpperCase()}</td>
              </tr>
            `).join('')}
          </table>

          ${report.concerningStudents.length > 0 ? `
            <h2>⚠️ Students Needing Attention</h2>
            ${report.concerningStudents.map((cs) => `
              <div class="concern">
                <strong>${cs.studentName}</strong>
                <ul>
                  ${cs.concerns.map((c) => `<li>${c}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          ` : ''}

          <p style="margin-top: 40px; color: #777; font-size: 12px;">
            Report generated on ${new Date().toLocaleString()}
          </p>
        </body>
      </html>
    `;
  }
}
