import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CyberbullyingController } from './cyberbullying.controller';
import { CyberbullyingService } from './cyberbullying.service';
import { TextAnalysisService } from './text-analysis.service';
import { BehavioralAnalysisService } from './behavioral-analysis.service';
import { SocialNetworkAnalysisService } from './social-network-analysis.service';
import { CyberbullyingIncidentService } from './incident.service';
import {
  CyberbullyingIncident,
  CyberbullyingIncidentSchema,
} from '../schemas/cyberbullying-incident.schema';
import {
  BehavioralAnomaly,
  BehavioralAnomalySchema,
} from '../schemas/behavioral-anomaly.schema';
import {
  CyberbullyingViolationLog,
  CyberbullyingViolationLogSchema,
} from '../schemas/cyberbullying-violation-log.schema';
import { Progress, ProgressSchema } from '../schemas/progress.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CyberbullyingIncident.name, schema: CyberbullyingIncidentSchema },
      { name: BehavioralAnomaly.name, schema: BehavioralAnomalySchema },
      {
        name: CyberbullyingViolationLog.name,
        schema: CyberbullyingViolationLogSchema,
      },
      { name: Progress.name, schema: ProgressSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AlertsModule,
  ],
  controllers: [CyberbullyingController],
  providers: [
    CyberbullyingService,
    TextAnalysisService,
    BehavioralAnalysisService,
    SocialNetworkAnalysisService,
    CyberbullyingIncidentService,
  ],
  exports: [
    CyberbullyingService,
    TextAnalysisService,
    CyberbullyingIncidentService,
  ],
})
export class CyberbullyingModule {}
