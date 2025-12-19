import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { GamesService } from '../games/games.service';
import { GameCategory, DifficultyLevel } from '../schemas/game.schema';
import { AgeGroup } from '../schemas/user.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const gamesService = app.get(GamesService);

  const sampleGames = [
    // Math Games
    {
      title: 'Number Adventure',
      titleArabic: 'مغامرة الأرقام',
      description: 'Learn counting and basic math through fun adventures!',
      descriptionArabic: 'تعلم العد والرياضيات الأساسية من خلال مغامرات ممتعة!',
      category: GameCategory.MATH,
      difficulty: DifficultyLevel.EASY,
      ageGroups: [AgeGroup.AGES_3_5, AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 50,
      isActive: true,
    },
    {
      title: 'Math Puzzle Master',
      titleArabic: 'سيد ألغاز الرياضيات',
      description: 'Solve math puzzles and improve your calculation skills!',
      descriptionArabic: 'حل ألغاز الرياضيات وحسّن مهاراتك في الحساب!',
      category: GameCategory.MATH,
      difficulty: DifficultyLevel.MEDIUM,
      ageGroups: [AgeGroup.AGES_3_5, AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 75,
      isActive: true,
    },
    {
      title: 'Algebra Explorer',
      titleArabic: 'مستكشف الجبر',
      description: 'Master algebra concepts through interactive challenges!',
      descriptionArabic: 'أتقن مفاهيم الجبر من خلال التحديات التفاعلية!',
      category: GameCategory.MATH,
      difficulty: DifficultyLevel.HARD,
      ageGroups: [AgeGroup.AGES_3_5, AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 100,
      isActive: true,
    },
    // Physics Games
    {
      title: 'Gravity Playground',
      titleArabic: 'ملعب الجاذبية',
      description: 'Explore gravity and motion in this fun physics game!',
      descriptionArabic: 'استكشف الجاذبية والحركة في هذه اللعبة الفيزيائية الممتعة!',
      category: GameCategory.PHYSICS,
      difficulty: DifficultyLevel.EASY,
      ageGroups: [AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 60,
      isActive: true,
    },
    {
      title: 'Force & Motion Lab',
      titleArabic: 'مختبر القوة والحركة',
      description: 'Experiment with forces and motion in virtual lab!',
      descriptionArabic: 'جرب القوى والحركة في مختبر افتراضي!',
      category: GameCategory.PHYSICS,
      difficulty: DifficultyLevel.MEDIUM,
      ageGroups: [AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 80,
      isActive: true,
    },
    {
      title: 'Quantum Quest',
      titleArabic: 'رحلة الكم',
      description: 'Discover the fascinating world of quantum physics!',
      descriptionArabic: 'اكتشف عالم فيزياء الكم الرائع!',
      category: GameCategory.PHYSICS,
      difficulty: DifficultyLevel.HARD,
      ageGroups: [AgeGroup.AGES_3_5, AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 120,
      isActive: true,
    },
    // Chemistry Games
    {
      title: 'Element Explorer',
      titleArabic: 'مستكشف العناصر',
      description: 'Learn about chemical elements and the periodic table!',
      descriptionArabic: 'تعلم عن العناصر الكيميائية والجدول الدوري!',
      category: GameCategory.CHEMISTRY,
      difficulty: DifficultyLevel.EASY,
      ageGroups: [AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 65,
      isActive: true,
    },
    {
      title: 'Reaction Master',
      titleArabic: 'سيد التفاعلات',
      description: 'Create chemical reactions and learn about compounds!',
      descriptionArabic: 'أنشئ تفاعلات كيميائية وتعلم عن المركبات!',
      category: GameCategory.CHEMISTRY,
      difficulty: DifficultyLevel.MEDIUM,
      ageGroups: [AgeGroup.AGES_9_12],
      pointsReward: 90,
      isActive: true,
    },
    // Language Games
    {
      title: 'Word Builder',
      titleArabic: 'باني الكلمات',
      description: 'Build words and improve your vocabulary in Arabic and English!',
      descriptionArabic: 'ابنِ الكلمات وحسّن مفرداتك في العربية والإنجليزية!',
      category: GameCategory.LANGUAGE,
      difficulty: DifficultyLevel.EASY,
      ageGroups: [AgeGroup.AGES_3_5, AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 55,
      isActive: true,
    },
    {
      title: 'Grammar Champion',
      titleArabic: 'بطل القواعد',
      description: 'Master grammar rules through fun challenges!',
      descriptionArabic: 'أتقن قواعد اللغة من خلال التحديات الممتعة!',
      category: GameCategory.LANGUAGE,
      difficulty: DifficultyLevel.MEDIUM,
      ageGroups: [AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 85,
      isActive: true,
    },
    // Coding Games
    {
      title: 'Code Blocks Adventure',
      titleArabic: 'مغامرة كتل الكود',
      description: 'Learn programming basics with visual code blocks!',
      descriptionArabic: 'تعلم أساسيات البرمجة باستخدام كتل الكود المرئية!',
      category: GameCategory.CODING,
      difficulty: DifficultyLevel.EASY,
      ageGroups: [AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 70,
      isActive: true,
    },
    {
      title: 'Algorithm Master',
      titleArabic: 'سيد الخوارزميات',
      description: 'Solve problems using algorithms and logic!',
      descriptionArabic: 'حل المشاكل باستخدام الخوارزميات والمنطق!',
      category: GameCategory.CODING,
      difficulty: DifficultyLevel.MEDIUM,
      ageGroups: [AgeGroup.AGES_9_12],
      pointsReward: 95,
      isActive: true,
    },
    {
      title: 'Python Quest',
      titleArabic: 'رحلة بايثون',
      description: 'Learn Python programming through interactive challenges!',
      descriptionArabic: 'تعلم برمجة بايثون من خلال التحديات التفاعلية!',
      category: GameCategory.CODING,
      difficulty: DifficultyLevel.HARD,
      ageGroups: [AgeGroup.AGES_9_12],
      pointsReward: 110,
      isActive: true,
    },
    // More Math Games
    {
      title: 'Counting Fun',
      titleArabic: 'العد الممتع',
      description: 'Learn to count from 1 to 10 with fun animations!',
      descriptionArabic: 'تعلم العد من 1 إلى 10 مع رسوم متحركة ممتعة!',
      category: GameCategory.MATH,
      difficulty: DifficultyLevel.EASY,
      ageGroups: [AgeGroup.AGES_3_5],
      pointsReward: 40,
      isActive: true,
    },
    {
      title: 'Shape Explorer',
      titleArabic: 'مستكشف الأشكال',
      description: 'Identify and learn about different shapes!',
      descriptionArabic: 'تعرف على الأشكال المختلفة وتعلم عنها!',
      category: GameCategory.MATH,
      difficulty: DifficultyLevel.EASY,
      ageGroups: [AgeGroup.AGES_3_5, AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 45,
      isActive: true,
    },
    {
      title: 'Multiplication Master',
      titleArabic: 'سيد الضرب',
      description: 'Master multiplication tables through fun games!',
      descriptionArabic: 'أتقن جداول الضرب من خلال ألعاب ممتعة!',
      category: GameCategory.MATH,
      difficulty: DifficultyLevel.MEDIUM,
      ageGroups: [AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 85,
      isActive: true,
    },
    {
      title: 'Geometry Adventure',
      titleArabic: 'مغامرة الهندسة',
      description: 'Explore geometric shapes and their properties!',
      descriptionArabic: 'استكشف الأشكال الهندسية وخصائصها!',
      category: GameCategory.MATH,
      difficulty: DifficultyLevel.HARD,
      ageGroups: [AgeGroup.AGES_3_5, AgeGroup.AGES_9_12],
      pointsReward: 105,
      isActive: true,
    },
    // More Language Games
    {
      title: 'Alphabet Journey',
      titleArabic: 'رحلة الأبجدية',
      description: 'Learn Arabic and English alphabets through interactive games!',
      descriptionArabic: 'تعلم الأبجديات العربية والإنجليزية من خلال ألعاب تفاعلية!',
      category: GameCategory.LANGUAGE,
      difficulty: DifficultyLevel.EASY,
      ageGroups: [AgeGroup.AGES_3_5],
      pointsReward: 45,
      isActive: true,
    },
    {
      title: 'Story Builder',
      titleArabic: 'باني القصص',
      description: 'Create your own stories in Arabic and English!',
      descriptionArabic: 'أنشئ قصصك الخاصة بالعربية والإنجليزية!',
      category: GameCategory.LANGUAGE,
      difficulty: DifficultyLevel.MEDIUM,
      ageGroups: [AgeGroup.AGES_3_5, AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 90,
      isActive: true,
    },
    {
      title: 'Vocabulary Champion',
      titleArabic: 'بطل المفردات',
      description: 'Expand your vocabulary in both languages!',
      descriptionArabic: 'وسّع مفرداتك في كلا اللغتين!',
      category: GameCategory.LANGUAGE,
      difficulty: DifficultyLevel.MEDIUM,
      ageGroups: [AgeGroup.AGES_9_12],
      pointsReward: 95,
      isActive: true,
    },
    {
      title: 'Reading Adventure',
      titleArabic: 'مغامرة القراءة',
      description: 'Improve reading skills with engaging stories!',
      descriptionArabic: 'حسّن مهارات القراءة مع قصص جذابة!',
      category: GameCategory.LANGUAGE,
      difficulty: DifficultyLevel.HARD,
      ageGroups: [AgeGroup.AGES_9_12],
      pointsReward: 100,
      isActive: true,
    },
    // More Programming Games
    {
      title: 'Scratch Basics',
      titleArabic: 'أساسيات سكراتش',
      description: 'Learn programming with Scratch visual blocks!',
      descriptionArabic: 'تعلم البرمجة باستخدام كتل سكراتش المرئية!',
      category: GameCategory.CODING,
      difficulty: DifficultyLevel.EASY,
      ageGroups: [AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 75,
      isActive: true,
    },
    {
      title: 'JavaScript Journey',
      titleArabic: 'رحلة جافا سكريبت',
      description: 'Learn JavaScript fundamentals through coding challenges!',
      descriptionArabic: 'تعلم أساسيات جافا سكريبت من خلال تحديات البرمجة!',
      category: GameCategory.CODING,
      difficulty: DifficultyLevel.MEDIUM,
      ageGroups: [AgeGroup.AGES_9_12],
      pointsReward: 100,
      isActive: true,
    },
    {
      title: 'Game Developer',
      titleArabic: 'مطور الألعاب',
      description: 'Create your own games using code!',
      descriptionArabic: 'أنشئ ألعابك الخاصة باستخدام الكود!',
      category: GameCategory.CODING,
      difficulty: DifficultyLevel.HARD,
      ageGroups: [AgeGroup.AGES_9_12],
      pointsReward: 125,
      isActive: true,
    },
    // History Games
    {
      title: 'Ancient Egypt Explorer',
      titleArabic: 'مستكشف مصر القديمة',
      description: 'Discover the wonders of ancient Egyptian civilization!',
      descriptionArabic: 'اكتشف عجائب الحضارة المصرية القديمة!',
      category: GameCategory.HISTORY,
      difficulty: DifficultyLevel.EASY,
      ageGroups: [AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 70,
      isActive: true,
    },
    {
      title: 'Pharaoh Quest',
      titleArabic: 'رحلة الفرعون',
      description: 'Learn about pharaohs and ancient Egyptian history!',
      descriptionArabic: 'تعلم عن الفراعنة وتاريخ مصر القديمة!',
      category: GameCategory.HISTORY,
      difficulty: DifficultyLevel.MEDIUM,
      ageGroups: [AgeGroup.AGES_6_8, AgeGroup.AGES_9_12],
      pointsReward: 85,
      isActive: true,
    },
    {
      title: 'Pyramid Builder',
      titleArabic: 'باني الأهرامات',
      description: 'Build pyramids and learn about ancient architecture!',
      descriptionArabic: 'ابنِ الأهرامات وتعلم عن العمارة القديمة!',
      category: GameCategory.HISTORY,
      difficulty: DifficultyLevel.MEDIUM,
      ageGroups: [AgeGroup.AGES_9_12],
      pointsReward: 90,
      isActive: true,
    },
    {
      title: 'World History Timeline',
      titleArabic: 'الجدول الزمني للتاريخ العالمي',
      description: 'Explore major events in world history!',
      descriptionArabic: 'استكشف الأحداث الرئيسية في التاريخ العالمي!',
      category: GameCategory.HISTORY,
      difficulty: DifficultyLevel.HARD,
      ageGroups: [AgeGroup.AGES_9_12],
      pointsReward: 115,
      isActive: true,
    },
    {
      title: 'Islamic History Adventure',
      titleArabic: 'مغامرة التاريخ الإسلامي',
      description: 'Learn about Islamic civilization and achievements!',
      descriptionArabic: 'تعلم عن الحضارة الإسلامية وإنجازاتها!',
      category: GameCategory.HISTORY,
      difficulty: DifficultyLevel.MEDIUM,
      ageGroups: [AgeGroup.AGES_9_12],
      pointsReward: 95,
      isActive: true,
    },
    // Java Basics Game
    {
      title: 'Java Basics',
      titleArabic: 'رحلة جافا',
      description: 'Learn Java programming fundamentals through interactive coding challenges! Master variables, loops, and object-oriented concepts.',
      descriptionArabic: 'تعلم أساسيات برمجة جافا من خلال تحديات البرمجة التفاعلية! أتقن المتغيرات والحلقات والمفاهيم الموجهة للكائنات.',
      category: GameCategory.CODING,
      difficulty: DifficultyLevel.HARD,
      ageGroups: [AgeGroup.AGES_9_12],
      pointsReward: 115,
      isActive: true,
    },
    // Logic Gates Master Game
    {
      title: 'Logic Gates Master',
      titleArabic: 'بوابات المنطق الرقمي',
      description: 'Master digital logic with interactive logic gates! Learn AND, OR, NOT, NAND gates and build circuits to solve puzzles.',
      descriptionArabic: 'أتقن المنطق الرقمي من خلال بوابات المنطق التفاعلية! تعلم بوابات AND و OR و NOT و NAND وابنِ الدوائر لحل الألغاز.',
      category: GameCategory.CODING,
      difficulty: DifficultyLevel.HARD,
      ageGroups: [AgeGroup.AGES_9_12],
      pointsReward: 120,
      isActive: true,
    },
  ];

  console.log('Seeding games...');
  
  for (const gameData of sampleGames) {
    try {
      const existing = await gamesService['gameModel'].findOne({ title: gameData.title });
      if (!existing) {
        await gamesService.create(gameData as any);
        console.log(`✓ Created: ${gameData.title}`);
      } else {
        console.log(`- Skipped (exists): ${gameData.title}`);
      }
    } catch (error) {
      console.error(`✗ Error creating ${gameData.title}:`, error);
    }
  }

  console.log('Games seeding completed!');
  await app.close();
}

bootstrap();

