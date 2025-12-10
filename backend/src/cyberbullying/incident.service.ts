import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CyberbullyingIncident,
  CyberbullyingIncidentDocument,
} from '../schemas/cyberbullying-incident.schema';
import {
  CyberbullyingViolationLog,
  CyberbullyingViolationLogDocument,
} from '../schemas/cyberbullying-violation-log.schema';
import { AlertsService } from '../alerts/alerts.service';

interface IncidentReport {
  reportedStudentId: string;
  victimStudentId: string;
  incidentType: 'text_analysis' | 'behavioral' | 'social_network' | 'manual_report';
  description: string;
  flaggedContent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  flagReasons: string[];
}

@Injectable()
export class CyberbullyingIncidentService {
  private readonly logger = new Logger(CyberbullyingIncidentService.name);

  constructor(
    @InjectModel(CyberbullyingIncident.name)
    private incidentModel: Model<CyberbullyingIncidentDocument>,
    @InjectModel(CyberbullyingViolationLog.name)
    private violationLogModel: Model<CyberbullyingViolationLogDocument>,
    private alertsService: AlertsService,
  ) {}

  /**
   * Reports a cyberbullying incident
   */
  async reportIncident(
    report: IncidentReport,
  ): Promise<CyberbullyingIncidentDocument> {
    const victimId = new Types.ObjectId(report.victimStudentId);
    const reportedId = new Types.ObjectId(report.reportedStudentId);

    // Get or create violation log for reported student
    let violationLog = await this.violationLogModel.findOne({
      studentId: reportedId,
    });

    if (!violationLog) {
      violationLog = await this.violationLogModel.create({
        studentId: reportedId,
        violationType: this.mapIncidentTypeToViolationType(report.incidentType),
        violationCount: 1,
        firstViolationDate: new Date(),
        status: 'active',
      });
    } else {
      violationLog.violationCount += 1;
      violationLog.lastViolationDate = new Date();
      await violationLog.save();
    }

    // Create incident record
    const incident = await this.incidentModel.create({
      reportedStudentId: reportedId,
      victimStudentId: victimId,
      incidentType: report.incidentType,
      description: report.description,
      flaggedContent: report.flaggedContent || '',
      severity: report.severity,
      flagReasons: report.flagReasons,
      status: 'pending',
      offenderViolationCount: violationLog.violationCount,
      appliedConsequences: [],
    });

    this.logger.log(
      `Incident reported: ${report.incidentType} - Student: ${report.reportedStudentId} against ${report.victimStudentId}`,
    );

    // Trigger alerts based on severity and violation count
    await this.triggerAlerts(incident, violationLog);

    return incident;
  }

  /**
   * Triggers appropriate alerts to teachers/parents
   */
  private async triggerAlerts(
    incident: CyberbullyingIncidentDocument,
    violationLog: CyberbullyingViolationLogDocument,
  ): Promise<void> {
    // Alert to teacher - always for any incident
    await this.alertsService.createCyberbullyingAlert(
      new Types.ObjectId(), // Teacher would be determined by class assignment
      'cyberbullying_incident',
      incident.severity,
      `Cyberbullying Incident - ${incident.severity.toUpperCase()}`,
      `${incident.description}. Violation count: ${violationLog.violationCount}`,
      {
        incidentId: incident._id,
        reportedStudent: incident.reportedStudentId,
        victimStudent: incident.victimStudentId,
      },
    );

    // Alert to parent - if violation count > 1
    if (violationLog.violationCount > 1) {
      const parentAlertTitle = `Parent Notification: Behavior Concern (Incident #${violationLog.violationCount})`;
      const parentAlertMessage =
        violationLog.violationCount === 2
          ? `We have identified another inappropriate behavior incident involving your student. Parent communication is required.`
          : `Your student has had ${violationLog.violationCount} behavior incidents. School disciplinary process may be initiated.`;

      // Parent alert would be sent via notification system
      this.logger.log(
        `Parent alert triggered for student ${incident.reportedStudentId}: violation count ${violationLog.violationCount}`,
      );
    }

    // Escalation alert - if critical severity or 3+ violations
    if (
      incident.severity === 'critical' ||
      violationLog.violationCount >= 3
    ) {
      this.logger.warn(
        `ESCALATION: Incident ${incident._id} requires admin/counselor review`,
      );
      // Would trigger admin dashboard notification
    }
  }

  /**
   * Gets incident history for a student
   */
  async getStudentIncidentHistory(
    studentId: string,
    role: 'reported' | 'victim' = 'reported',
  ): Promise<CyberbullyingIncidentDocument[]> {
    const query: any = {};

    if (role === 'reported') {
      query.reportedStudentId = new Types.ObjectId(studentId);
    } else {
      query.victimStudentId = new Types.ObjectId(studentId);
    }

    return this.incidentModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('reportedStudentId victimStudentId teacherId');
  }

  /**
   * Gets violation log for a student
   */
  async getViolationLog(
    studentId: string,
  ): Promise<CyberbullyingViolationLogDocument | null> {
    return this.violationLogModel.findOne({
      studentId: new Types.ObjectId(studentId),
    });
  }

  /**
   * Reviews an incident (teacher action)
   */
  async reviewIncident(
    incidentId: string,
    teacherId: string,
    notes: string,
    decision: 'valid' | 'invalid',
  ): Promise<CyberbullyingIncidentDocument> {
    const incident = await this.incidentModel.findByIdAndUpdate(
      incidentId,
      {
        status: decision === 'valid' ? 'reviewed' : 'dismissed',
        teacherNotes: notes,
        reviewedBy: new Types.ObjectId(teacherId),
      },
      { new: true },
    );

    if (incident.status === 'dismissed') {
      this.logger.log(`Incident ${incidentId} dismissed by teacher`);
    }

    return incident;
  }

  /**
   * Applies consequences to offending student
   */
  async applyConsequences(
    incidentId: string,
    consequences: string[],
    restrictionEndDate?: Date,
  ): Promise<CyberbullyingIncidentDocument> {
    const incident = await this.incidentModel.findById(incidentId);
    const violationLog = await this.violationLogModel.findOne({
      studentId: incident.reportedStudentId,
    });

    // Map violation count to consequences
    const applicableConsequences = this.determineConsequences(
      violationLog.violationCount,
    );

    // Update incident
    const updatedIncident = await this.incidentModel.findByIdAndUpdate(
      incidentId,
      {
        appliedConsequences: applicableConsequences,
        status: 'resolved',
        resolvedAt: new Date(),
      },
      { new: true },
    );

    // Update violation log
    await this.violationLogModel.findByIdAndUpdate(violationLog._id, {
      appliedConsequences: applicableConsequences,
      currentRestrictionEndDate: restrictionEndDate,
      status: this.determineViolationStatus(violationLog.violationCount),
    });

    this.logger.log(
      `Consequences applied to incident ${incidentId}: ${applicableConsequences.join(', ')}`,
    );

    return updatedIncident;
  }

  /**
   * Notifies victim of incident
   */
  async notifyVictim(incidentId: string): Promise<void> {
    const incident = await this.incidentModel.findByIdAndUpdate(
      incidentId,
      { victimNotified: true },
      { new: true },
    );

    // Send supportive message to victim
    const supportMessage = `We take cyberbullying seriously. The behavior has been addressed. If you need support, please talk to your teacher or school counselor.`;

    this.logger.log(`Victim ${incident.victimStudentId} notified of action`);
    // Message would be sent via notification system
  }

  /**
   * Notifies parent of bullying student
   */
  async notifyParent(incidentId: string): Promise<void> {
    const incident = await this.incidentModel.findByIdAndUpdate(
      incidentId,
      { parentNotified: true },
      { new: true },
    );

    this.logger.log(
      `Parent of student ${incident.reportedStudentId} notified of incident`,
    );
    // Email/notification would be sent to parent
  }

  /**
   * Gets class-wide cyberbullying statistics
   */
  async getClassStatistics(timeWindowDays: number = 30): Promise<{
    totalIncidents: number;
    incidentsByType: Record<string, number>;
    incidentsBySeverity: Record<string, number>;
    studentInvolved: number;
    resolvedRate: number;
  }> {
    const startDate = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);

    const incidents = await this.incidentModel
      .find({ createdAt: { $gte: startDate } })
      .lean();

    const incidentsByType: Record<string, number> = {};
    const incidentsBySeverity: Record<string, number> = {};
    const studentsInvolved = new Set<string>();

    let resolved = 0;

    for (const incident of incidents) {
      // Count by type
      incidentsByType[incident.incidentType] =
        (incidentsByType[incident.incidentType] || 0) + 1;

      // Count by severity
      incidentsBySeverity[incident.severity] =
        (incidentsBySeverity[incident.severity] || 0) + 1;

      // Track students involved
      studentsInvolved.add(incident.reportedStudentId.toString());
      studentsInvolved.add(incident.victimStudentId.toString());

      // Count resolved
      if (incident.status === 'resolved') {
        resolved += 1;
      }
    }

    return {
      totalIncidents: incidents.length,
      incidentsByType,
      incidentsBySeverity,
      studentInvolved: studentsInvolved.size,
      resolvedRate: incidents.length > 0 ? (resolved / incidents.length) * 100 : 0,
    };
  }

  /**
   * Helper: Map incident type to violation type
   */
  private mapIncidentTypeToViolationType(
    incidentType: string,
  ): 'inappropriate_message' | 'harassment' | 'exclusion' | 'mocking' | 'threat' {
    const mapping = {
      text_analysis: 'inappropriate_message' as const,
      behavioral: 'harassment' as const,
      social_network: 'exclusion' as const,
      manual_report: 'mocking' as const,
    };
    return mapping[incidentType] || 'inappropriate_message';
  }

  /**
   * Helper: Determine consequences based on violation count
   */
  private determineConsequences(violationCount: number): string[] {
    if (violationCount === 1) {
      return [
        'Warning message',
        '1 hour message timeout',
        'Parent notification',
      ];
    } else if (violationCount === 2) {
      return [
        'Parent conversation required',
        '24 hour chat ban',
        'Kindness training module',
        'Apology letter to victim',
      ];
    } else if (violationCount === 3) {
      return [
        '1 week group activity restriction',
        'Parent and counselor meeting',
        'Mandatory empathy training',
      ];
    } else {
      return [
        'Account restricted',
        'Admin review required',
        'School disciplinary process',
      ];
    }
  }

  /**
   * Helper: Determine violation status
   */
  private determineViolationStatus(
    violationCount: number,
  ): 'active' | 'restricted' | 'banned' {
    if (violationCount >= 4) {
      return 'banned';
    } else if (violationCount >= 3) {
      return 'restricted';
    } else {
      return 'active';
    }
  }

  /**
   * Checks if a message should be blocked before posting
   */
  async shouldBlockMessage(
    senderId: string,
    isFlagged: boolean,
  ): Promise<boolean> {
    if (!isFlagged) return false;

    const violationLog = await this.violationLogModel.findOne({
      studentId: new Types.ObjectId(senderId),
    });

    if (!violationLog) {
      // First time flagged message - don't block, just warn
      return false;
    }

    // If under message restriction, block
    if (
      violationLog.currentRestrictionEndDate &&
      violationLog.currentRestrictionEndDate > new Date()
    ) {
      return true;
    }

    return false;
  }

  /**
   * Gets pending incidents for teacher review
   */
  async getPendingIncidents(): Promise<CyberbullyingIncidentDocument[]> {
    return this.incidentModel
      .find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('reportedStudentId victimStudentId');
  }
}
