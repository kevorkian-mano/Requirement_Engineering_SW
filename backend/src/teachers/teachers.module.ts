import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { TeacherClass, TeacherClassSchema } from '../schemas/teacher-class.schema';
import { TeacherAlert, TeacherAlertSchema } from '../schemas/teacher-alert.schema';
import { TeacherNote, TeacherNoteSchema } from '../schemas/teacher-note.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { PlayerLevel, PlayerLevelSchema } from '../schemas/player-level.schema';
import { Progress, ProgressSchema } from '../schemas/progress.schema';
import {
  CyberbullyingIncident,
  CyberbullyingIncidentSchema,
} from '../schemas/cyberbullying-incident.schema';
import { Course, CourseSchema } from '../schemas/course.schema';
import { Game, GameSchema } from '../schemas/game.schema';
import { TeachersController } from './teachers.controller';
import { TeacherDashboardService } from './teacher-dashboard.service';
import { TeacherMonitoringService } from './teacher-monitoring.service';
import { TeacherNotesService } from './teacher-notes.service';
import { ParentCommunicationService } from './parent-communication.service';
import { ReportGenerationService } from './report-generation.service';
import { TeacherCourseService } from './teacher-course.service';
import { TeacherAuthorizationService } from './teacher-authorization.service';

@Module({
  imports: [
    // Import ScheduleModule for cron jobs in monitoring service
    ScheduleModule.forRoot(),
    // Register all required schemas
    MongooseModule.forFeature([
      { name: TeacherClass.name, schema: TeacherClassSchema },
      { name: TeacherAlert.name, schema: TeacherAlertSchema },
      { name: TeacherNote.name, schema: TeacherNoteSchema },
      { name: User.name, schema: UserSchema },
      { name: PlayerLevel.name, schema: PlayerLevelSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: CyberbullyingIncident.name, schema: CyberbullyingIncidentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Game.name, schema: GameSchema },
    ]),
  ],
  controllers: [TeachersController],
  providers: [
    TeacherDashboardService,
    TeacherMonitoringService,
    TeacherNotesService,
    ParentCommunicationService,
    ReportGenerationService,
    TeacherCourseService,
    TeacherAuthorizationService,
  ],
  exports: [
    TeacherDashboardService,
    TeacherMonitoringService,
    TeacherNotesService,
    ParentCommunicationService,
    ReportGenerationService,
    TeacherCourseService,
  ],
})
export class TeachersModule {}
