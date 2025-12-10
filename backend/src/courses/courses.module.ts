import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from '../schemas/course.schema';
import { Game, GameSchema } from '../schemas/game.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { CoursesController } from './courses.controller';
import { CourseAssignmentController } from './course-assignment.controller';
import { CoursesService } from './courses.service';
import { TeacherAuthorizationService } from '../teachers/teacher-authorization.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Game.name, schema: GameSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CoursesController, CourseAssignmentController],
  providers: [CoursesService, TeacherAuthorizationService],
  exports: [CoursesService],
})
export class CoursesModule {}
