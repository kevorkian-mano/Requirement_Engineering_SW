import { Injectable, Logger } from '@nestjs/common';
import { TextAnalysisService } from './text-analysis.service';
import { BehavioralAnalysisService } from './behavioral-analysis.service';
import { SocialNetworkAnalysisService } from './social-network-analysis.service';
import { CyberbullyingIncidentService } from './incident.service';

export interface MessageCheckResult {
  blocked: boolean;
  flagged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  reasons: string[];
  sanitized: string;
}

@Injectable()
export class CyberbullyingService {
  private readonly logger = new Logger(CyberbullyingService.name);

  constructor(
    private textAnalysisService: TextAnalysisService,
    private behavioralAnalysisService: BehavioralAnalysisService,
    private socialNetworkAnalysisService: SocialNetworkAnalysisService,
    private incidentService: CyberbullyingIncidentService,
  ) {}

  /**
   * Comprehensive message check - Layer 1 of cyberbullying detection
   */
  async checkMessage(
    senderId: string,
    recipientId: string,
    messageContent: string,
  ): Promise<MessageCheckResult> {
    // Text analysis
    const textAnalysis = this.textAnalysisService.analyzeText(messageContent);

    // Check if message should be blocked (based on violation status)
    const shouldBlock = await this.incidentService.shouldBlockMessage(
      senderId,
      textAnalysis.isFlagged,
    );

    const result: MessageCheckResult = {
      blocked: shouldBlock,
      flagged: textAnalysis.isFlagged,
      severity: textAnalysis.isFlagged ? textAnalysis.severity : null,
      reasons: textAnalysis.reasons,
      sanitized: this.textAnalysisService.sanitizeText(messageContent),
    };

    // If flagged, report incident
    if (textAnalysis.isFlagged) {
      await this.incidentService.reportIncident({
        reportedStudentId: senderId,
        victimStudentId: recipientId,
        incidentType: 'text_analysis',
        description: `Message flagged for inappropriate content: "${messageContent.substring(0, 100)}"`,
        flaggedContent: messageContent,
        severity: textAnalysis.severity,
        flagReasons: textAnalysis.reasons,
      });

      this.logger.warn(
        `Message from ${senderId} flagged - ${textAnalysis.severity} severity`,
      );
    }

    return result;
  }

  /**
   * Behavioral analysis - Layer 2 of cyberbullying detection
   * Runs periodically (e.g., daily) to detect distress patterns
   */
  async analyzeBehavioralPatterns(studentId: string): Promise<void> {
    const distressIndicators =
      await this.behavioralAnalysisService.analyzeBehavioralPatterns(studentId);

    for (const indicator of distressIndicators) {
      // Record the anomaly
      const anomaly = await this.behavioralAnalysisService.recordAnomaly(
        studentId,
        indicator,
      );

      // Alert teacher
      this.logger.log(
        `Behavioral anomaly detected for student ${studentId}: ${indicator.type}`,
      );

      // Only report as incident if moderate-high severity
      if (
        indicator.severity === 'high' ||
        indicator.type === 'sudden_performance_drop'
      ) {
        await this.incidentService.reportIncident({
          reportedStudentId: '', // No specific offender
          victimStudentId: studentId,
          incidentType: 'behavioral',
          description: indicator.description,
          severity: indicator.severity === 'high' ? 'medium' : 'low',
          flagReasons: [indicator.type, indicator.description],
        });
      }
    }
  }

  /**
   * Social network analysis - Layer 3 of cyberbullying detection
   * Runs periodically to detect isolation and coordinated bullying
   */
  async analyzeSocialPatterns(
    classroomId: string,
    timeWindowDays: number = 14,
  ): Promise<void> {
    const anomalies = await this.socialNetworkAnalysisService.analyzeSocialPatterns(
      classroomId,
      timeWindowDays,
    );

    for (const anomaly of anomalies) {
      // Report each social anomaly
      for (const bullyerId of anomaly.bullyingStudents) {
        await this.incidentService.reportIncident({
          reportedStudentId: bullyerId,
          victimStudentId: anomaly.targetedStudent,
          incidentType: 'social_network',
          description: anomaly.description,
          severity: anomaly.severity,
          flagReasons: [anomaly.type],
        });
      }

      this.logger.log(
        `Social anomaly detected: ${anomaly.type} - Target: ${anomaly.targetedStudent}`,
      );
    }
  }

  /**
   * Full system check - runs all three layers for a student
   */
  async fullSystemCheck(studentId: string, classroomId: string): Promise<void> {
    this.logger.log(`Running full cyberbullying check for student ${studentId}`);

    try {
      // Layer 2: Behavioral analysis
      await this.analyzeBehavioralPatterns(studentId);

      // Layer 3: Social network analysis
      await this.analyzeSocialPatterns(classroomId);
    } catch (error) {
      this.logger.error(
        `Error during full system check for ${studentId}:`,
        error,
      );
    }
  }

  /**
   * Gets comprehensive safety dashboard data for teacher
   */
  async getTeacherSafetyDashboard(classroomId: string): Promise<{
    pendingIncidents: number;
    highRiskStudents: Array<{ studentId: string; riskScore: number }>;
    statistics: Record<string, any>;
    recentIncidents: Array<{ incidentId: string; severity: string; description: string }>;
  }> {
    const stats = await this.incidentService.getClassStatistics();
    const pending = await this.incidentService.getPendingIncidents();

    return {
      pendingIncidents: pending.length,
      highRiskStudents: this.identifyHighRiskStudents(stats),
      statistics: stats,
      recentIncidents: pending.slice(0, 5).map((inc) => ({
        incidentId: inc._id.toString(),
        severity: inc.severity,
        description: inc.description,
      })),
    };
  }

  /**
   * Helper: Identify high-risk students
   */
  private identifyHighRiskStudents(
    stats: any,
  ): Array<{ studentId: string; riskScore: number }> {
    // In real implementation, would analyze specific student profiles
    // For now, return empty array - would be populated from violation logs
    return [];
  }

  /**
   * Gets student safety profile
   */
  async getStudentSafetyProfile(studentId: string): Promise<{
    victimRisk: 'low' | 'medium' | 'high';
    offenderRisk: 'low' | 'medium' | 'high';
    incidentCount: number;
    lastIncident: Date | null;
    actionRequired: boolean;
  }> {
    const victimIncidents = await this.incidentService.getStudentIncidentHistory(
      studentId,
      'victim',
    );
    const offenderIncidents = await this.incidentService.getStudentIncidentHistory(
      studentId,
      'reported',
    );
    const violationLog = await this.incidentService.getViolationLog(studentId);

    const victimRisk =
      victimIncidents.length > 3
        ? 'high'
        : victimIncidents.length > 1
          ? 'medium'
          : 'low';

    const offenderRisk =
      (violationLog?.violationCount || 0) > 2
        ? 'high'
        : (violationLog?.violationCount || 0) > 0
          ? 'medium'
          : 'low';

    return {
      victimRisk,
      offenderRisk,
      incidentCount: offenderIncidents.length,
      lastIncident:
        offenderIncidents.length > 0 ? (offenderIncidents[0] as any).createdAt : null,
      actionRequired:
        victimRisk === 'high' ||
        (offenderRisk === 'high' &&
          (violationLog?.currentRestrictionEndDate || null) > new Date()),
    };
  }

  /**
   * Gets hotspot analysis - which students/interactions have high bullying risk
   */
  async getHotspotAnalysis(classroomId: string): Promise<{
    highriskPairs: Array<{
      bully: string;
      victim: string;
      incidents: number;
    }>;
    isolatedStudents: string[];
    concerningTrends: string[];
  }> {
    const stats = await this.incidentService.getClassStatistics();

    // Would analyze specific student pairs and patterns
    // For now, return structure
    return {
      highriskPairs: [],
      isolatedStudents: [],
      concerningTrends: [
        'Monitor for increasing incident frequency',
        'Check for new user involvement in bullying',
      ],
    };
  }
}
