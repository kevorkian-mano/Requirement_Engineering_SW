import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { PlayerLevel, PlayerLevelDocument } from '../schemas/player-level.schema';
import { Progress, ProgressDocument } from '../schemas/progress.schema';

export interface WeeklyReport {
  student: {
    id: string;
    name: string;
    email: string;
  };
  weekSummary: {
    gamesPlayed: number;
    averageScore: number;
    xpEarned: number;
    achievementsEarned: number;
    levelUps: number;
  };
  highlights: string[];
  concerns: string[];
  recommendations: string[];
}

@Injectable()
export class ParentCommunicationService {
  private readonly logger = new Logger(ParentCommunicationService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(PlayerLevel.name)
    private playerLevelModel: Model<PlayerLevelDocument>,
    @InjectModel(Progress.name)
    private progressModel: Model<ProgressDocument>,
  ) {}

  /**
   * Generate weekly progress report for student
   */
  async generateWeeklyReport(studentId: string): Promise<WeeklyReport> {
    const student = await this.userModel.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get games played this week
    const weekProgress = await this.progressModel.find({
      userId: new Types.ObjectId(studentId),
      completedAt: { $gte: weekAgo },
    });

    const gamesPlayed = weekProgress.length;
    const averageScore =
      gamesPlayed > 0
        ? weekProgress.reduce((sum, p) => sum + (p.score || 0), 0) / gamesPlayed
        : 0;

    const xpEarned = weekProgress.reduce((sum, p) => sum + (p.pointsEarned || 0), 0);

    // Get player level info
    const playerLevel = await this.playerLevelModel.findOne({
      userId: new Types.ObjectId(studentId),
    });

    // Count level-ups this week
    // Count level-ups this week by iterating over levelUpHistory object
    const levelUps = playerLevel ? Object.values(playerLevel.levelUpHistory).filter(
      (achievedAt: Date) => achievedAt >= weekAgo,
    ).length : 0;

    // Generate highlights
    const highlights: string[] = [];
    if (levelUps > 0) {
      highlights.push(
        `Reached Level ${playerLevel.currentLevel}! 🎉`,
      );
    }
    if (averageScore >= 80) {
      highlights.push(`Excellent scores averaging ${averageScore.toFixed(1)}%`);
    }
    if (gamesPlayed >= 10) {
      highlights.push(`Very engaged - played ${gamesPlayed} games this week`);
    }
    if (weekProgress.some((p) => p.score >= 90)) {
      highlights.push(`Achieved scores of 90% or higher!`);
    }

    // Generate concerns
    const concerns: string[] = [];
    if (gamesPlayed === 0) {
      concerns.push('No games played this week');
    } else if (gamesPlayed < 3) {
      concerns.push('Low engagement - only played a few games');
    }
    if (averageScore < 50 && gamesPlayed > 0) {
      concerns.push(`Scores below 50% - may need extra support`);
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (gamesPlayed === 0) {
      recommendations.push('Encourage daily practice - even 10 minutes helps!');
    }
    if (averageScore < 60 && gamesPlayed > 0) {
      recommendations.push('Consider reviewing concepts with your child');
      recommendations.push('Try easier games to build confidence');
    }
    if (gamesPlayed > 15) {
      recommendations.push('Great engagement! Consider balancing screen time');
    }
    if (concerns.length === 0 && highlights.length > 0) {
      recommendations.push('Keep up the excellent work!');
      recommendations.push('Challenge your child with harder games');
    }

    return {
      student: {
        id: student._id.toString(),
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
      },
      weekSummary: {
        gamesPlayed,
        averageScore: parseFloat(averageScore.toFixed(1)),
        xpEarned,
        achievementsEarned: 0, // TODO: implement when achievements ready
        levelUps,
      },
      highlights,
      concerns,
      recommendations,
    };
  }

  /**
   * Generate formatted email content for parent
   */
  async generateParentEmail(studentId: string): Promise<{
    subject: string;
    htmlBody: string;
    textBody: string;
  }> {
    const report = await this.generateWeeklyReport(studentId);

    const subject = `Weekly Progress Report for ${report.student.name}`;

    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Weekly Progress Report</h2>
          <p>Dear Parent/Guardian,</p>
          <p>Here's how ${report.student.name} did this week:</p>

          <h3>📊 This Week's Summary</h3>
          <ul>
            <li>Games Played: ${report.weekSummary.gamesPlayed}</li>
            <li>Average Score: ${report.weekSummary.averageScore}%</li>
            <li>XP Earned: ${report.weekSummary.xpEarned}</li>
            <li>Level Ups: ${report.weekSummary.levelUps}</li>
          </ul>

          ${report.highlights.length > 0 ? `
            <h3>🌟 Highlights</h3>
            <ul>
              ${report.highlights.map((h) => `<li>${h}</li>`).join('')}
            </ul>
          ` : ''}

          ${report.concerns.length > 0 ? `
            <h3>⚠️ Areas for Attention</h3>
            <ul>
              ${report.concerns.map((c) => `<li>${c}</li>`).join('')}
            </ul>
          ` : ''}

          ${report.recommendations.length > 0 ? `
            <h3>💡 Recommendations</h3>
            <ul>
              ${report.recommendations.map((r) => `<li>${r}</li>`).join('')}
            </ul>
          ` : ''}

          <p>If you have any questions or concerns, please don't hesitate to reach out.</p>
          <p>Best regards,<br/>Your Child's Teacher</p>
        </body>
      </html>
    `;

    const textBody = `
Weekly Progress Report for ${report.student.name}

Dear Parent/Guardian,

Here's how ${report.student.name} did this week:

THIS WEEK'S SUMMARY:
- Games Played: ${report.weekSummary.gamesPlayed}
- Average Score: ${report.weekSummary.averageScore}%
- XP Earned: ${report.weekSummary.xpEarned}
- Level Ups: ${report.weekSummary.levelUps}

${report.highlights.length > 0 ? `
HIGHLIGHTS:
${report.highlights.map((h) => `- ${h}`).join('\n')}
` : ''}

${report.concerns.length > 0 ? `
AREAS FOR ATTENTION:
${report.concerns.map((c) => `- ${c}`).join('\n')}
` : ''}

${report.recommendations.length > 0 ? `
RECOMMENDATIONS:
${report.recommendations.map((r) => `- ${r}`).join('\n')}
` : ''}

If you have any questions or concerns, please don't hesitate to reach out.

Best regards,
Your Child's Teacher
    `;

    return { subject, htmlBody, textBody };
  }

  /**
   * Send parent notification about cyberbullying incident
   */
  async generateCyberbullyingNotification(
    studentId: string,
    incidentType: string,
    severity: string,
    isVictim: boolean,
  ): Promise<{
    subject: string;
    htmlBody: string;
    textBody: string;
  }> {
    const student = await this.userModel.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const studentName = `${student.firstName} ${student.lastName}`;

    const subject = isVictim
      ? `Important: Safety Notification for ${studentName}`
      : `Important: Behavioral Notification for ${studentName}`;

    const htmlBody = isVictim
      ? `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Safety Notification</h2>
          <p>Dear Parent/Guardian,</p>
          <p>We want to inform you that ${studentName} was involved in an incident on our platform.</p>
          
          <p><strong>Incident Type:</strong> ${incidentType}</p>
          <p><strong>Severity:</strong> ${severity}</p>

          <h3>What We're Doing:</h3>
          <ul>
            <li>The incident has been investigated and addressed</li>
            <li>The other student has been warned/disciplined</li>
            <li>${studentName} is being supported and protected</li>
            <li>We are monitoring the situation closely</li>
          </ul>

          <h3>What You Can Do:</h3>
          <ul>
            <li>Talk to ${studentName} about the incident</li>
            <li>Reassure them that they are safe</li>
            <li>Encourage them to report any future concerns</li>
            <li>Contact us if you have questions or concerns</li>
          </ul>

          <p>Your child's safety and wellbeing are our top priority.</p>
          <p>Best regards,<br/>The Teaching Team</p>
        </body>
      </html>
    `
      : `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Behavioral Notification</h2>
          <p>Dear Parent/Guardian,</p>
          <p>We need to inform you about a behavioral incident involving ${studentName}.</p>
          
          <p><strong>Incident Type:</strong> ${incidentType}</p>
          <p><strong>Severity:</strong> ${severity}</p>

          <h3>What Happened:</h3>
          <p>${studentName} engaged in behavior that violated our community guidelines.</p>

          <h3>Our Response:</h3>
          <ul>
            <li>The incident has been documented</li>
            <li>${studentName} has been informed about appropriate behavior</li>
            <li>Consequences have been applied as appropriate</li>
            <li>We are monitoring ${studentName}'s behavior</li>
          </ul>

          <h3>What We Need From You:</h3>
          <ul>
            <li>Please discuss this incident with ${studentName}</li>
            <li>Reinforce the importance of kind online behavior</li>
            <li>Help ${studentName} understand the impact of their actions</li>
            <li>Contact us if you'd like to discuss further</li>
          </ul>

          <p>We want to work together to ensure all students have a positive, safe experience.</p>
          <p>Best regards,<br/>The Teaching Team</p>
        </body>
      </html>
    `;

    const textBody = isVictim
      ? `Safety Notification for ${studentName}

Dear Parent/Guardian,

We want to inform you that ${studentName} was involved in an incident on our platform.

Incident Type: ${incidentType}
Severity: ${severity}

WHAT WE'RE DOING:
- The incident has been investigated and addressed
- The other student has been warned/disciplined
- ${studentName} is being supported and protected
- We are monitoring the situation closely

WHAT YOU CAN DO:
- Talk to ${studentName} about the incident
- Reassure them that they are safe
- Encourage them to report any future concerns
- Contact us if you have questions or concerns

Your child's safety and wellbeing are our top priority.

Best regards,
The Teaching Team`
      : `Behavioral Notification for ${studentName}

Dear Parent/Guardian,

We need to inform you about a behavioral incident involving ${studentName}.

Incident Type: ${incidentType}
Severity: ${severity}

WHAT HAPPENED:
${studentName} engaged in behavior that violated our community guidelines.

OUR RESPONSE:
- The incident has been documented
- ${studentName} has been informed about appropriate behavior
- Consequences have been applied as appropriate
- We are monitoring ${studentName}'s behavior

WHAT WE NEED FROM YOU:
- Please discuss this incident with ${studentName}
- Reinforce the importance of kind online behavior
- Help ${studentName} understand the impact of their actions
- Contact us if you'd like to discuss further

We want to work together to ensure all students have a positive, safe experience.

Best regards,
The Teaching Team`;

    return { subject, htmlBody, textBody };
  }

  /**
   * Log parent contact (for record-keeping)
   */
  async logParentContact(contactData: {
    teacherId: string;
    studentId: string;
    contactType: 'email' | 'phone' | 'meeting' | 'message';
    subject: string;
    notes: string;
  }): Promise<void> {
    // This would integrate with TeacherNotes service
    this.logger.log(
      `Parent contact logged: ${contactData.contactType} for student ${contactData.studentId}`,
    );
    // TODO: Create note in TeacherNotes system
  }
}
