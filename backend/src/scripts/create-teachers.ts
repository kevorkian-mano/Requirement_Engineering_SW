import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Course, CourseDocument } from '../schemas/course.schema';
import * as bcrypt from 'bcryptjs';

/**
 * Script to create teacher accounts and assign them to courses
 * Usage: npm run create:teacher
 */

// Configuration: Define your teachers here - ONE teacher per course
const TEACHERS_CONFIG = [
  {
    email: 'physics.teacher@school.com',
    password: 'Teacher123!',
    firstName: 'John',
    lastName: 'Smith',
    courses: ['PHY-101'], // Physics only
  },
  {
    email: 'chemistry.teacher@school.com',
    password: 'Teacher123!',
    firstName: 'Sarah',
    lastName: 'Johnson',
    courses: ['CHEM-101'], // Chemistry only
  },
  {
    email: 'math.teacher@school.com',
    password: 'Teacher123!',
    firstName: 'Michael',
    lastName: 'Chen',
    courses: ['MATH-101'], // Mathematics only
  },
  {
    email: 'language.teacher@school.com',
    password: 'Teacher123!',
    firstName: 'Emma',
    lastName: 'Wilson',
    courses: ['LANG-101'], // Language Arts only
  },
  {
    email: 'coding.teacher@school.com',
    password: 'Teacher123!',
    firstName: 'David',
    lastName: 'Brown',
    courses: ['CODE-101'], // Coding only
  },
  {
    email: 'history.teacher@school.com',
    password: 'Teacher123!',
    firstName: 'Lisa',
    lastName: 'Martinez',
    courses: ['HIST-101'], // History only
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const courseModel = app.get<Model<CourseDocument>>(getModelToken(Course.name));

  console.log('🎓 Creating teacher accounts and assigning courses...\n');

  try {
    for (const teacherConfig of TEACHERS_CONFIG) {
      console.log(`👨‍🏫 Processing ${teacherConfig.firstName} ${teacherConfig.lastName} (${teacherConfig.email})...`);

      // Check if teacher already exists
      let teacher = await userModel.findOne({ email: teacherConfig.email });

      if (teacher) {
        console.log(`   ℹ️  Teacher already exists`);
      } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(teacherConfig.password, 10);

        // Create teacher account
        teacher = await userModel.create({
          email: teacherConfig.email,
          password: hashedPassword,
          firstName: teacherConfig.firstName,
          lastName: teacherConfig.lastName,
          role: 'teacher',
          isActive: true,
          points: 0,
          level: 1,
          totalScreenTime: 0,
          loginStreak: 0,
        });

        console.log(`   ✅ Created teacher account`);
      }

      // Get courses by codes
      const courses = await courseModel.find({ 
        code: { $in: teacherConfig.courses } 
      });

      if (courses.length !== teacherConfig.courses.length) {
        const foundCodes = courses.map(c => c.code);
        const missingCodes = teacherConfig.courses.filter(code => !foundCodes.includes(code));
        console.log(`   ⚠️  Warning: Some courses not found: ${missingCodes.join(', ')}`);
      }

      // Update teacher's courseIds
      teacher.courseIds = courses.map(c => c._id);
      await teacher.save();

      // Add teacher to courses' teacherIds
      for (const course of courses) {
        if (!course.teacherIds.includes(teacher._id)) {
          course.teacherIds.push(teacher._id);
          await course.save();
        }
      }

      console.log(`   ✅ Assigned to courses: ${courses.map(c => c.name).join(', ')}`);
      console.log(`   📧 Email: ${teacherConfig.email}`);
      console.log(`   🔑 Password: ${teacherConfig.password}`);
      console.log('');
    }

    console.log('✨ Teacher account creation complete!\n');
    console.log('📊 Summary:');
    console.log(`   Total teachers processed: ${TEACHERS_CONFIG.length}`);
    
    console.log('\n📝 Teacher Login Credentials:');
    console.log('═══════════════════════════════════════════════════════════');
    for (const teacher of TEACHERS_CONFIG) {
      console.log(`${teacher.firstName} ${teacher.lastName}:`);
      console.log(`  Email: ${teacher.email}`);
      console.log(`  Password: ${teacher.password}`);
      console.log(`  Courses: ${teacher.courses.join(', ')}`);
      console.log('');
    }
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error creating teachers:', error.message);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

bootstrap();
