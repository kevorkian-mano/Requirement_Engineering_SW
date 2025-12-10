import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CyberbullyingService, MessageCheckResult } from './cyberbullying.service';
import { CyberbullyingIncidentService } from './incident.service';
import { TextAnalysisService, TextAnalysisResult } from './text-analysis.service';

@Controller('cyberbullying')
export class CyberbullyingController {
  constructor(
    private cyberbullyingService: CyberbullyingService,
    private incidentService: CyberbullyingIncidentService,
    private textAnalysisService: TextAnalysisService,
  ) {}

  /**
   * Check a message for cyberbullying content (Layer 1 - Text Analysis)
   * POST /cyberbullying/check-message
   */
  @Post('check-message')
  async checkMessage(
    @Body()
    body: {
      senderId: string;
      recipientId: string;
      messageContent: string;
    },
  ): Promise<MessageCheckResult> {
    return this.cyberbullyingService.checkMessage(
      body.senderId,
      body.recipientId,
      body.messageContent,
    );
  }

  /**
   * Manually report cyberbullying incident
   * POST /cyberbullying/report
   */
  @Post('report')
  async reportIncident(
    @Body()
    body: {
      reportedStudentId: string;
      victimStudentId: string;
      description: string;
      evidence?: string;
    },
  ) {
    return this.incidentService.reportIncident({
      reportedStudentId: body.reportedStudentId,
      victimStudentId: body.victimStudentId,
      incidentType: 'manual_report',
      description: body.description,
      severity: 'medium',
      flagReasons: ['Manual teacher report'],
    });
  }

  /**
   * Get student incident history
   * GET /cyberbullying/incidents/student/:studentId
   */
  @Get('incidents/student/:studentId')
  async getStudentIncidents(
    @Param('studentId') studentId: string,
    @Query('role') role: 'reported' | 'victim' = 'reported',
  ) {
    return this.incidentService.getStudentIncidentHistory(studentId, role);
  }

  /**
   * Get student safety profile
   * GET /cyberbullying/student/:studentId/safety-profile
   */
  @Get('student/:studentId/safety-profile')
  async getStudentSafetyProfile(@Param('studentId') studentId: string) {
    return this.cyberbullyingService.getStudentSafetyProfile(studentId);
  }

  /**
   * Get student violation log
   * GET /cyberbullying/student/:studentId/violations
   */
  @Get('student/:studentId/violations')
  async getViolationLog(@Param('studentId') studentId: string) {
    return this.incidentService.getViolationLog(studentId);
  }

  /**
   * Teacher: Get pending incidents for review
   * GET /cyberbullying/incidents/pending
   */
  @Get('incidents/pending')
  async getPendingIncidents() {
    return this.incidentService.getPendingIncidents();
  }

  /**
   * Teacher: Review an incident
   * PUT /cyberbullying/incidents/:incidentId/review
   */
  @Put('incidents/:incidentId/review')
  async reviewIncident(
    @Param('incidentId') incidentId: string,
    @Body()
    body: {
      teacherId: string;
      notes: string;
      decision: 'valid' | 'invalid';
    },
  ) {
    return this.incidentService.reviewIncident(
      incidentId,
      body.teacherId,
      body.notes,
      body.decision,
    );
  }

  /**
   * Teacher: Apply consequences to offender
   * PUT /cyberbullying/incidents/:incidentId/apply-consequences
   */
  @Put('incidents/:incidentId/apply-consequences')
  async applyConsequences(
    @Param('incidentId') incidentId: string,
    @Body()
    body: {
      consequences: string[];
      restrictionDays?: number;
    },
  ) {
    const restrictionEndDate = body.restrictionDays
      ? new Date(Date.now() + body.restrictionDays * 24 * 60 * 60 * 1000)
      : undefined;

    return this.incidentService.applyConsequences(
      incidentId,
      body.consequences,
      restrictionEndDate,
    );
  }

  /**
   * Teacher: Notify victim
   * POST /cyberbullying/incidents/:incidentId/notify-victim
   */
  @Post('incidents/:incidentId/notify-victim')
  async notifyVictim(@Param('incidentId') incidentId: string) {
    await this.incidentService.notifyVictim(incidentId);
    return { success: true, message: 'Victim notified' };
  }

  /**
   * Teacher: Notify parent
   * POST /cyberbullying/incidents/:incidentId/notify-parent
   */
  @Post('incidents/:incidentId/notify-parent')
  async notifyParent(@Param('incidentId') incidentId: string) {
    await this.incidentService.notifyParent(incidentId);
    return { success: true, message: 'Parent notified' };
  }

  /**
   * Teacher: Get classroom statistics
   * GET /cyberbullying/statistics/classroom
   */
  @Get('statistics/classroom')
  async getClassStatistics(
    @Query('timeWindowDays') timeWindowDays: number = 30,
  ) {
    return this.incidentService.getClassStatistics(timeWindowDays);
  }

  /**
   * Teacher: Get safety dashboard
   * GET /cyberbullying/dashboard
   */
  @Get('dashboard')
  async getSafetyDashboard(@Query('classroomId') classroomId: string) {
    return this.cyberbullyingService.getTeacherSafetyDashboard(classroomId);
  }

  /**
   * Teacher: Get hotspot analysis
   * GET /cyberbullying/analysis/hotspots
   */
  @Get('analysis/hotspots')
  async getHotspotAnalysis(@Query('classroomId') classroomId: string) {
    return this.cyberbullyingService.getHotspotAnalysis(classroomId);
  }

  /**
   * Analyze behavioral patterns for a student (Layer 2)
   * POST /cyberbullying/analyze/behavior/:studentId
   */
  @Post('analyze/behavior/:studentId')
  async analyzeBehavior(@Param('studentId') studentId: string) {
    await this.cyberbullyingService.analyzeBehavioralPatterns(studentId);
    return { success: true, message: 'Behavioral analysis completed' };
  }

  /**
   * Analyze social patterns for classroom (Layer 3)
   * POST /cyberbullying/analyze/social
   */
  @Post('analyze/social')
  async analyzeSocial(
    @Body() body: { classroomId: string; timeWindowDays?: number },
  ) {
    await this.cyberbullyingService.analyzeSocialPatterns(
      body.classroomId,
      body.timeWindowDays || 14,
    );
    return { success: true, message: 'Social analysis completed' };
  }

  /**
   * Run full system check for a student
   * POST /cyberbullying/full-check/:studentId
   */
  @Post('full-check/:studentId')
  async fullCheck(
    @Param('studentId') studentId: string,
    @Body() body: { classroomId: string },
  ) {
    await this.cyberbullyingService.fullSystemCheck(
      studentId,
      body.classroomId,
    );
    return { success: true, message: 'Full system check completed' };
  }

  /**
   * Analyze text content (test endpoint)
   * POST /cyberbullying/analyze-text
   */
  @Post('analyze-text')
  analyzeText(@Body() body: { content: string }): TextAnalysisResult {
    return this.textAnalysisService.analyzeText(body.content);
  }
}
