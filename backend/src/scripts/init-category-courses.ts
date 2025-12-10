import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CoursesService } from '../courses/courses.service';
import { GamesService } from '../games/games.service';
import { GameCategory } from '../schemas/game.schema';

/**
 * Script to initialize courses based on game categories
 * Each game category becomes a course
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const coursesService = app.get(CoursesService);
  const gamesService = app.get(GamesService);

  console.log('🎓 Initializing category-based courses...\n');

  // Define courses based on game categories
  const categoryCoursesData = [
    {
      category: GameCategory.PHYSICS,
      name: 'Physics',
      nameArabic: 'الفيزياء',
      code: 'PHY-101',
      description: 'Interactive physics games and simulations',
      descriptionArabic: 'ألعاب ومحاكاة فيزيائية تفاعلية',
      subject: 'Science',
    },
    {
      category: GameCategory.CHEMISTRY,
      name: 'Chemistry',
      nameArabic: 'الكيمياء',
      code: 'CHEM-101',
      description: 'Chemistry experiments and educational games',
      descriptionArabic: 'تجارب كيميائية وألعاب تعليمية',
      subject: 'Science',
    },
    {
      category: GameCategory.MATH,
      name: 'Mathematics',
      nameArabic: 'الرياضيات',
      code: 'MATH-101',
      description: 'Mathematical puzzles and problem-solving games',
      descriptionArabic: 'ألغاز رياضية وألعاب حل المشكلات',
      subject: 'Mathematics',
    },
    {
      category: GameCategory.LANGUAGE,
      name: 'Language Arts',
      nameArabic: 'فنون اللغة',
      code: 'LANG-101',
      description: 'Language learning through interactive games',
      descriptionArabic: 'تعلم اللغة من خلال الألعاب التفاعلية',
      subject: 'Language',
    },
    {
      category: GameCategory.CODING,
      name: 'Coding & Programming',
      nameArabic: 'البرمجة والترميز',
      code: 'CODE-101',
      description: 'Introduction to programming through games',
      descriptionArabic: 'مقدمة في البرمجة من خلال الألعاب',
      subject: 'Computer Science',
    },
    {
      category: GameCategory.HISTORY,
      name: 'History',
      nameArabic: 'التاريخ',
      code: 'HIST-101',
      description: 'Historical events and cultural exploration games',
      descriptionArabic: 'أحداث تاريخية وألعاب استكشاف ثقافية',
      subject: 'Social Studies',
    },
  ];

  try {
    for (const courseData of categoryCoursesData) {
      console.log(`📚 Processing ${courseData.name} (${courseData.category})...`);

      // Check if course already exists
      const existingCourse = await coursesService.findByCode(courseData.code);
      
      if (existingCourse) {
        console.log(`   ✓ Course already exists: ${existingCourse.name}`);
        
        // Update games for this course
        const games = await gamesService.findAll(undefined, courseData.category);
        const gameIds = games.map(game => game._id.toString());
        
        if (gameIds.length > 0) {
          await coursesService.updateGameIds(existingCourse._id.toString(), gameIds);
          console.log(`   ✓ Updated with ${gameIds.length} games`);
        }
        
        console.log('');
        continue;
      }

      // Get all games for this category
      const games = await gamesService.findAll(undefined, courseData.category);
      const gameIds = games.map(game => game._id.toString());

      console.log(`   Found ${gameIds.length} games in ${courseData.category} category`);

      // Create the course
      const course = await coursesService.create({
        name: courseData.name,
        nameArabic: courseData.nameArabic,
        code: courseData.code,
        description: courseData.description,
        descriptionArabic: courseData.descriptionArabic,
        subject: courseData.subject,
        level: 'All Levels',
        gameIds,
        topics: [courseData.category],
        settings: {
          enableGameBasedLearning: true,
          enableLeaderboard: true,
          enableTeamWork: false,
          minGamesRequired: 5,
        },
      });

      console.log(`   ✅ Created course: ${course.name} with ${gameIds.length} games`);
      console.log('');
    }

    console.log('✨ Category-based courses initialization complete!\n');
    console.log('📊 Summary:');
    const allCourses = await coursesService.findAll();
    console.log(`   Total courses: ${allCourses.length}`);
    
    for (const course of allCourses) {
      console.log(`   - ${course.name} (${course.code}): ${course.gameIds.length} games`);
    }

  } catch (error) {
    console.error('❌ Error initializing courses:', error.message);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

bootstrap();
