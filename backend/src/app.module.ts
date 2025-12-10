import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { ProgressModule } from './progress/progress.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AlertsModule } from './alerts/alerts.module';
import { AchievementsModule } from './achievements/achievements.module';
import { CyberbullyingModule } from './cyberbullying/cyberbullying.module';
import { LevelsModule } from './levels/levels.module';
import { TeachersModule } from './teachers/teachers.module';
import { CoursesModule } from './courses/courses.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    GamesModule,
    ProgressModule,
    MonitoringModule,
    AlertsModule,
    AchievementsModule,
    CyberbullyingModule,
    LevelsModule,
    TeachersModule,
    CoursesModule,
  ],
})
export class AppModule {}

