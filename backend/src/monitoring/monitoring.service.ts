import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument, ActivityType } from '../schemas/activity.schema';
import { UsersService } from '../users/users.service';
import { ScreenTimeQueryDto, TimeRange } from './dto/screen-time-query.dto';
import { UserDocument, UserRole } from '../schemas/user.schema';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    private usersService: UsersService,
  ) {}

  async logActivity(
    userId: string,
    type: ActivityType,
    duration: number,
    gameId?: string,
    metadata?: Record<string, any>,
  ): Promise<ActivityDocument> {
    const activity = new this.activityModel({
      userId: new Types.ObjectId(userId),
      type,
      duration,
      gameId: gameId ? new Types.ObjectId(gameId) : undefined,
      metadata,
      timestamp: new Date(),
    });

    await activity.save();

    // Update user's total screen time
    const minutes = Math.floor(duration / 60);
    if (minutes > 0) {
      await this.usersService.updateScreenTime(userId, minutes);
    }

    return activity;
  }

  async getScreenTime(
    userId: string,
    queryDto: ScreenTimeQueryDto,
    requester: UserDocument,
  ): Promise<any> {
    // Check permissions
    if (requester.role === UserRole.CHILD && requester._id.toString() !== userId) {
      throw new ForbiddenException('You can only view your own screen time');
    }

    if (requester.role === UserRole.PARENT) {
      const children = await this.usersService.getChildren(requester._id.toString());
      const childIds = children.map((c) => c._id.toString());
      if (!childIds.includes(userId)) {
        throw new ForbiddenException('You can only view your children\'s screen time');
      }
    }

    const { startDate, endDate, range } = queryDto;
    let start: Date;
    let end: Date = new Date();

    if (range) {
      switch (range) {
        case TimeRange.DAY:
          start = new Date();
          start.setHours(0, 0, 0, 0);
          break;
        case TimeRange.WEEK:
          start = new Date();
          start.setDate(start.getDate() - 7);
          break;
        case TimeRange.MONTH:
          start = new Date();
          start.setMonth(start.getMonth() - 1);
          break;
      }
    } else if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to last 7 days
      start = new Date();
      start.setDate(start.getDate() - 7);
    }

    const activities = await this.activityModel.find({
      userId: new Types.ObjectId(userId),
      timestamp: { $gte: start, $lte: end },
    });

    const totalTime = activities.reduce((sum, activity) => sum + activity.duration, 0);
    const totalMinutes = Math.floor(totalTime / 60);

    // Group by date
    const dailyBreakdown = activities.reduce((acc, activity) => {
      const date = new Date(activity.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += activity.duration;
      return acc;
    }, {} as Record<string, number>);

    // Group by activity type
    const activityBreakdown = activities.reduce((acc, activity) => {
      if (!acc[activity.type]) {
        acc[activity.type] = 0;
      }
      acc[activity.type] += activity.duration;
      return acc;
    }, {} as Record<string, number>);

    return {
      userId,
      period: { start, end },
      totalMinutes,
      totalSeconds: totalTime,
      dailyBreakdown: Object.entries(dailyBreakdown).map(([date, seconds]) => ({
        date,
        minutes: Math.floor(seconds / 60),
      })),
      activityBreakdown: Object.entries(activityBreakdown).map(([type, seconds]) => ({
        type,
        minutes: Math.floor(seconds / 60),
      })),
      totalActivities: activities.length,
    };
  }

  async getActivityLog(
    userId: string,
    queryDto: ScreenTimeQueryDto,
    requester: UserDocument,
  ): Promise<ActivityDocument[]> {
    // Check permissions (same as screen time)
    if (requester.role === UserRole.CHILD && requester._id.toString() !== userId) {
      throw new ForbiddenException('You can only view your own activity');
    }

    if (requester.role === UserRole.PARENT) {
      const children = await this.usersService.getChildren(requester._id.toString());
      const childIds = children.map((c) => c._id.toString());
      if (!childIds.includes(userId)) {
        throw new ForbiddenException('You can only view your children\'s activity');
      }
    }

    const { startDate, endDate, range } = queryDto;
    let start: Date;
    let end: Date = new Date();

    if (range) {
      switch (range) {
        case TimeRange.DAY:
          start = new Date();
          start.setHours(0, 0, 0, 0);
          break;
        case TimeRange.WEEK:
          start = new Date();
          start.setDate(start.getDate() - 7);
          break;
        case TimeRange.MONTH:
          start = new Date();
          start.setMonth(start.getMonth() - 1);
          break;
      }
    } else if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      start = new Date();
      start.setDate(start.getDate() - 7);
    }

    return this.activityModel
      .find({
        userId: new Types.ObjectId(userId),
        timestamp: { $gte: start, $lte: end },
      })
      .populate('gameId')
      .sort({ timestamp: -1 })
      .limit(100);
  }

  async getClassActivity(teacherId: string): Promise<any> {
    const students = await this.usersService.getStudents(teacherId);
    const studentIds = students.map((s) => s._id.toString());

    const activities = await this.activityModel
      .find({
        userId: { $in: studentIds.map((id) => new Types.ObjectId(id)) },
      })
      .populate('userId')
      .populate('gameId')
      .sort({ timestamp: -1 })
      .limit(200);

    // Aggregate by student
    const studentStats = students.map((student) => {
      const studentActivities = activities.filter(
        (a) => a.userId && (a.userId as any)._id.toString() === student._id.toString(),
      );
      const totalTime = studentActivities.reduce((sum, a) => sum + a.duration, 0);

      return {
        student: {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          avatar: student.avatar,
        },
        totalMinutes: Math.floor(totalTime / 60),
        activityCount: studentActivities.length,
        lastActivity: studentActivities[0]?.timestamp || null,
      };
    });

    return {
      students: studentStats,
      totalStudents: students.length,
    };
  }

  async getBehaviorPatterns(userId: string, requester: UserDocument): Promise<any> {
    // Check permissions
    if (requester.role === UserRole.CHILD && requester._id.toString() !== userId) {
      throw new ForbiddenException('You can only view your own patterns');
    }

    if (requester.role === UserRole.PARENT) {
      const children = await this.usersService.getChildren(requester._id.toString());
      const childIds = children.map((c) => c._id.toString());
      if (!childIds.includes(userId)) {
        throw new ForbiddenException('You can only view your children\'s patterns');
      }
    }

    // Get last 30 days of activities
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const activities = await this.activityModel.find({
      userId: new Types.ObjectId(userId),
      timestamp: { $gte: startDate },
    });

    // Analyze patterns
    const patterns = {
      peakHours: this.analyzePeakHours(activities),
      sessionFrequency: this.analyzeSessionFrequency(activities),
      contentTypes: this.analyzeContentTypes(activities),
      gamingPatterns: this.analyzeGamingPatterns(activities),
      breakPatterns: this.analyzeBreakPatterns(activities),
    };

    return patterns;
  }

  private analyzePeakHours(activities: ActivityDocument[]): number[] {
    const hourCounts: Record<number, number> = {};
    
    activities.forEach((activity) => {
      const hour = new Date(activity.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Get top 3 peak hours
    return Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private analyzeSessionFrequency(activities: ActivityDocument[]): any {
    // Group activities by day
    const dailySessions: Record<string, number> = {};
    
    activities.forEach((activity) => {
      const date = new Date(activity.timestamp).toISOString().split('T')[0];
      dailySessions[date] = (dailySessions[date] || 0) + 1;
    });

    const sessionCounts = Object.values(dailySessions);
    const avgSessionsPerDay = sessionCounts.reduce((a, b) => a + b, 0) / sessionCounts.length || 0;

    return {
      averagePerDay: Math.round(avgSessionsPerDay * 10) / 10,
      totalDays: Object.keys(dailySessions).length,
      maxSessionsInDay: Math.max(...sessionCounts, 0),
    };
  }

  private analyzeContentTypes(activities: ActivityDocument[]): any {
    const typeCounts: Record<string, number> = {};
    const typeTime: Record<string, number> = {};

    activities.forEach((activity) => {
      typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1;
      typeTime[activity.type] = (typeTime[activity.type] || 0) + activity.duration;
    });

    return Object.keys(typeCounts).map((type) => ({
      type,
      count: typeCounts[type],
      totalMinutes: Math.floor(typeTime[type] / 60),
    }));
  }

  private analyzeGamingPatterns(activities: ActivityDocument[]): any {
    const gameActivities = activities.filter((a) => a.type === ActivityType.GAME_PLAYED);
    
    if (gameActivities.length === 0) {
      return { totalGames: 0, averageDuration: 0, longestSession: 0 };
    }

    const durations = gameActivities.map((a) => a.duration);
    const totalDuration = durations.reduce((a, b) => a + b, 0);
    const averageDuration = totalDuration / durations.length;
    const longestSession = Math.max(...durations);

    return {
      totalGames: gameActivities.length,
      averageDuration: Math.floor(averageDuration / 60), // in minutes
      longestSession: Math.floor(longestSession / 60), // in minutes
    };
  }

  private analyzeBreakPatterns(activities: ActivityDocument[]): any {
    // Sort by timestamp
    const sorted = [...activities].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    let totalBreakTime = 0;
    let breakCount = 0;

    for (let i = 1; i < sorted.length; i++) {
      const prevTime = new Date(sorted[i - 1].timestamp).getTime();
      const currTime = new Date(sorted[i].timestamp).getTime();
      const gap = (currTime - prevTime) / 1000; // in seconds

      // Consider a break if gap is more than 5 minutes
      if (gap > 300) {
        totalBreakTime += gap;
        breakCount++;
      }
    }

    return {
      breakCount,
      averageBreakDuration: breakCount > 0 ? Math.floor(totalBreakTime / breakCount / 60) : 0,
    };
  }

  async getAnalyticsSummary(userId: string, requester: UserDocument): Promise<any> {
    // Check permissions
    if (requester.role === UserRole.CHILD && requester._id.toString() !== userId) {
      throw new ForbiddenException('You can only view your own analytics');
    }

    if (requester.role === UserRole.PARENT) {
      const children = await this.usersService.getChildren(requester._id.toString());
      const childIds = children.map((c) => c._id.toString());
      if (!childIds.includes(userId)) {
        throw new ForbiddenException('You can only view your children\'s analytics');
      }
    }

    // Get screen time data
    const screenTime = await this.getScreenTime(userId, { range: 'week' as any }, requester);
    
    // Get activity log
    const activities = await this.getActivityLog(userId, { range: 'week' as any }, requester);
    
    // Get behavior patterns
    const patterns = await this.getBehaviorPatterns(userId, requester);

    return {
      screenTime,
      activities: activities.slice(0, 10), // Last 10 activities
      patterns,
      summary: {
        totalActivities: activities.length,
        totalScreenTime: screenTime.totalMinutes,
        averageSessionDuration: activities.length > 0 
          ? Math.floor(screenTime.totalSeconds / activities.length / 60)
          : 0,
      },
    };
  }
}

