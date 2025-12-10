import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Achievement, AchievementDocument, AchievementType, UserAchievement, UserAchievementDocument } from '../schemas/achievement.schema';
import { Progress, ProgressDocument } from '../schemas/progress.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Game, GameDocument } from '../schemas/game.schema';

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  private achievementTemplates = [
    // Easy Achievements
    {
      code: 'first_game',
      name: 'Getting Started',
      nameArabic: 'البداية الأولى',
      description: 'Complete your first game',
      descriptionArabic: 'أكمل لعبتك الأولى',
      type: AchievementType.FIRST_GAME,
      icon: '🎮',
      pointsReward: 50,
      difficulty: 'easy',
      criteria: { gamesCompleted: 1 }
    },
    {
      code: 'curious_learner',
      name: 'Curious Learner',
      nameArabic: 'متعلم فضولي',
      description: 'Play games from 3 different categories',
      descriptionArabic: 'العب ألعاب من 3 فئات مختلفة',
      type: AchievementType.DAILY_LEARNER,
      icon: '🔍',
      pointsReward: 50,
      difficulty: 'easy',
      criteria: { categoriesPlayed: 3 }
    },
    {
      code: 'early_bird',
      name: 'Early Bird',
      nameArabic: 'الطائر المبكر',
      description: 'Log in and play on 3 different days',
      descriptionArabic: 'تسجيل الدخول واللعب في 3 أيام مختلفة',
      type: AchievementType.DAILY_LEARNER,
      icon: '🌅',
      pointsReward: 50,
      difficulty: 'easy',
      criteria: { daysActive: 3 }
    },
    {
      code: 'first_perfect',
      name: 'First Perfect',
      nameArabic: 'الأول المثالي',
      description: 'Score 100% on any game',
      descriptionArabic: 'احصل على 100٪ في أي لعبة',
      type: AchievementType.FIRST_GAME,
      icon: '💯',
      pointsReward: 75,
      difficulty: 'easy',
      criteria: { perfectScore: true }
    },
    {
      code: 'speed_learner',
      name: 'Speed Learner',
      nameArabic: 'متعلم سريع',
      description: 'Complete a game in under 3 minutes',
      descriptionArabic: 'أكمل لعبة في أقل من 3 دقائق',
      type: AchievementType.FIRST_GAME,
      icon: '⚡',
      pointsReward: 60,
      difficulty: 'easy',
      criteria: { speedRun: 180 } // 180 seconds = 3 minutes
    },

    // Medium Achievements
    {
      code: 'math_master',
      name: 'Math Master',
      nameArabic: 'سيد الرياضيات',
      description: 'Complete 5 math games',
      descriptionArabic: 'أكمل 5 ألعاب رياضية',
      type: AchievementType.MATH_MASTER,
      icon: '📐',
      pointsReward: 100,
      difficulty: 'medium',
      criteria: { categoryGames: { category: 'math', count: 5 } }
    },
    {
      code: 'word_wizard',
      name: 'Word Wizard',
      nameArabic: 'ساحر الكلمات',
      description: 'Complete 5 language games',
      descriptionArabic: 'أكمل 5 ألعاب لغوية',
      type: AchievementType.LANGUAGE_CHAMPION,
      icon: '📝',
      pointsReward: 100,
      difficulty: 'medium',
      criteria: { categoryGames: { category: 'language', count: 5 } }
    },
    {
      code: 'scientist',
      name: 'Scientist',
      nameArabic: 'عالم',
      description: 'Complete physics and chemistry games',
      descriptionArabic: 'أكمل ألعاب الفيزياء والكيمياء',
      type: AchievementType.PHYSICS_GENIUS,
      icon: '🧪',
      pointsReward: 100,
      difficulty: 'medium',
      criteria: { categoryGames: { categories: ['physics', 'chemistry'], count: 5 } }
    },
    {
      code: 'consistent',
      name: 'Consistent',
      nameArabic: 'متسق',
      description: 'Play for 7 days in a row',
      descriptionArabic: 'العب لمدة 7 أيام متتالية',
      type: AchievementType.STREAK_MASTER,
      icon: '🔥',
      pointsReward: 100,
      difficulty: 'medium',
      criteria: { consecutiveDays: 7 }
    },
    {
      code: 'problem_solver',
      name: 'Problem Solver',
      nameArabic: 'حل المشاكل',
      description: 'Complete 10 games total',
      descriptionArabic: 'أكمل 10 ألعاب إجمالاً',
      type: AchievementType.GAME_COMPLETION,
      icon: '🧩',
      pointsReward: 100,
      difficulty: 'medium',
      criteria: { gamesCompleted: 10 }
    },
    {
      code: 'efficient_learner',
      name: 'Efficient Learner',
      nameArabic: 'متعلم فعال',
      description: 'Complete 5 games without using hints',
      descriptionArabic: 'أكمل 5 ألعاب بدون استخدام التلميحات',
      type: AchievementType.FIRST_GAME,
      icon: '💡',
      pointsReward: 100,
      difficulty: 'medium',
      criteria: { gamesWithoutHints: 5 }
    },

    // Hard Achievements
    {
      code: 'renaissance_scholar',
      name: 'Renaissance Scholar',
      nameArabic: 'عالم النهضة',
      description: 'Complete games from all 6 categories',
      descriptionArabic: 'أكمل ألعاب من جميع الفئات الـ 6',
      type: AchievementType.GAME_COMPLETION,
      icon: '🏆',
      pointsReward: 300,
      difficulty: 'hard',
      criteria: { allCategories: true }
    },
    {
      code: 'true_master',
      name: 'True Master',
      nameArabic: 'السيد الحقيقي',
      description: 'Complete all available games',
      descriptionArabic: 'أكمل جميع الألعاب المتاحة',
      type: AchievementType.GAME_COMPLETION,
      icon: '👑',
      pointsReward: 500,
      difficulty: 'hard',
      criteria: { allGames: true }
    },
    {
      code: 'speedster',
      name: 'Speedster',
      nameArabic: 'السريع',
      description: 'Complete 20 games in under 2 minutes each',
      descriptionArabic: 'أكمل 20 لعبة في أقل من دقيقتين لكل منها',
      type: AchievementType.FIRST_GAME,
      icon: '🚀',
      pointsReward: 250,
      difficulty: 'hard',
      criteria: { speedRunCount: 20 }
    },
    {
      code: 'perfect_student',
      name: 'Perfect Student',
      nameArabic: 'الطالب المثالي',
      description: 'Achieve 90%+ completion rate overall',
      descriptionArabic: 'حقق معدل إكمال 90٪ +',
      type: AchievementType.FIRST_GAME,
      icon: '⭐',
      pointsReward: 400,
      difficulty: 'hard',
      criteria: { completionRate: 90 }
    },
    {
      code: 'unstoppable',
      name: 'Unstoppable',
      nameArabic: 'لا يمكن إيقافه',
      description: 'Complete 30 games without using hints once',
      descriptionArabic: 'أكمل 30 لعبة بدون استخدام التلميحات',
      type: AchievementType.FIRST_GAME,
      icon: '💪',
      pointsReward: 350,
      difficulty: 'hard',
      criteria: { gamesWithoutHints: 30 }
    },
    {
      code: 'coder',
      name: 'Coder',
      nameArabic: 'مبرمج',
      description: 'Complete all coding games',
      descriptionArabic: 'أكمل جميع ألعاب الترميز',
      type: AchievementType.CODING_STAR,
      icon: '💻',
      pointsReward: 300,
      difficulty: 'hard',
      criteria: { categoryGames: { category: 'coding', allGames: true } }
    },

    // Special Achievements
    {
      code: 'comeback_kid',
      name: 'Comeback Kid',
      nameArabic: 'طفل العودة',
      description: 'Fail a game, then pass it on second try',
      descriptionArabic: 'فشل في لعبة، ثم نجح في المحاولة الثانية',
      type: AchievementType.FIRST_GAME,
      icon: '🎯',
      pointsReward: 75,
      difficulty: 'easy',
      criteria: { comebackWin: true }
    },
    {
      code: 'determined',
      name: 'Determined',
      nameArabic: 'مصمم',
      description: 'Play the same game 3 times improving each time',
      descriptionArabic: 'العب نفس اللعبة 3 مرات محسناً كل مرة',
      type: AchievementType.FIRST_GAME,
      icon: '📈',
      pointsReward: 100,
      difficulty: 'medium',
      criteria: { improvedRepeat: { game: true, times: 3, improving: true } }
    },
    {
      code: 'helper',
      name: 'Helper',
      nameArabic: 'مساعد',
      description: 'Help a classmate achieve an achievement',
      descriptionArabic: 'ساعد زميلاً في الفصل على تحقيق إنجاز',
      type: AchievementType.DAILY_LEARNER,
      icon: '🤝',
      pointsReward: 100,
      difficulty: 'medium',
      criteria: { helpingBehavior: true }
    }
  ];

  constructor(
    @InjectModel(Achievement.name) private achievementModel: Model<AchievementDocument>,
    @InjectModel(UserAchievement.name) private userAchievementModel: Model<UserAchievementDocument>,
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
  ) {
    this.initializeAchievements();
  }

  async initializeAchievements() {
    for (const template of this.achievementTemplates) {
      const exists = await this.achievementModel.findOne({ code: template.code });
      if (!exists) {
        await this.achievementModel.create(template);
        this.logger.log(`Created achievement: ${template.code}`);
      }
    }
  }

  async checkAndUnlockAchievements(userId: string): Promise<any[]> {
    const userObjectId = new Types.ObjectId(userId);
    const userProgress = await this.progressModel.find({ userId: userObjectId }).populate('gameId');
    const allAchievements = await this.achievementModel.find({ });
    const unlockedAchievements = await this.userAchievementModel.find({ userId: userObjectId });
    const unlockedAchievementIds = unlockedAchievements.map(ua => ua.achievementId.toString());

    const newlyUnlocked: any[] = [];

    for (const achievement of allAchievements) {
      if (unlockedAchievementIds.includes(achievement._id.toString())) {
        continue; // Already unlocked
      }

      const isUnlocked = await this.checkAchievementCriteria(achievement, userProgress, userObjectId);

      if (isUnlocked) {
        const userAchievement = await this.userAchievementModel.create({
          userId: userObjectId,
          achievementId: achievement._id,
          unlockedAt: new Date(),
        });

        newlyUnlocked.push({
          _id: achievement._id,
          code: achievement.code,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          pointsReward: achievement.pointsReward,
          difficulty: (achievement as any).difficulty || 'medium',
          unlockedAt: userAchievement.unlockedAt
        });

        this.logger.log(`Achievement unlocked for user ${userId}: ${achievement.code}`);
      }
    }

    return newlyUnlocked;
  }

  private async checkAchievementCriteria(achievement: any, userProgress: ProgressDocument[], userId: Types.ObjectId): Promise<boolean> {
    const criteria = achievement.criteria;

    // Games completed
    if (criteria.gamesCompleted !== undefined) {
      const completedCount = userProgress.filter(p => p.isCompleted).length;
      if (completedCount < criteria.gamesCompleted) return false;
    }

    // Perfect score (100%)
    if (criteria.perfectScore === true) {
      const perfectGames = userProgress.filter(p => p.completionPercentage === 100);
      if (perfectGames.length === 0) return false;
    }

    // Speed run (complete in X seconds)
    if (criteria.speedRun !== undefined) {
      const fastGames = userProgress.filter(p => p.timeSpent < criteria.speedRun);
      if (fastGames.length === 0) return false;
    }

    // Speed run count
    if (criteria.speedRunCount !== undefined) {
      const fastGames = userProgress.filter(p => p.timeSpent < 120); // Under 2 minutes
      if (fastGames.length < criteria.speedRunCount) return false;
    }

    // Games without hints
    if (criteria.gamesWithoutHints !== undefined) {
      const noHintGames = userProgress.filter(p => !p.gameData?.hintsUsed || p.gameData?.hintsUsed === 0).length;
      if (noHintGames < criteria.gamesWithoutHints) return false;
    }

    // Category games
    if (criteria.categoryGames) {
      if (criteria.categoryGames.allGames === true) {
        // Get all games in category
        const categoryGames = await this.gameModel.find({ category: criteria.categoryGames.category });
        const completedInCategory = userProgress.filter(p => 
          p.isCompleted && categoryGames.some(g => g._id.equals(p.gameId as any))
        ).length;
        if (completedInCategory < categoryGames.length) return false;
      } else {
        // Minimum count in category
        const gamesInCategory = await this.gameModel.find({ category: criteria.categoryGames.category });
        const completedInCategory = userProgress.filter(p => 
          p.isCompleted && gamesInCategory.some(g => g._id.equals(p.gameId as any))
        ).length;
        if (completedInCategory < (criteria.categoryGames.count || 0)) return false;
      }
    }

    // All categories
    if (criteria.allCategories === true) {
      const games = await this.gameModel.find({});
      const categories = new Set(userProgress
        .filter(p => p.isCompleted && p.gameId)
        .map(p => (p.gameId as any).category)
        .filter(Boolean));
      
      const uniqueCategories = new Set(games.map(g => g.category));
      if (categories.size < uniqueCategories.size) return false;
    }

    // All games
    if (criteria.allGames === true) {
      const totalGames = await this.gameModel.countDocuments({});
      const completedGames = userProgress.filter(p => p.isCompleted).length;
      if (completedGames < totalGames) return false;
    }

    // Categories played
    if (criteria.categoriesPlayed !== undefined) {
      const games = await this.gameModel.find({});
      const categories = new Set(userProgress
        .map(p => (p.gameId as any).category)
        .filter(Boolean));
      if (categories.size < criteria.categoriesPlayed) return false;
    }

    // Days active
    if (criteria.daysActive !== undefined) {
      const uniqueDays = new Set(
        userProgress.map(p => new Date((p as any).createdAt).toDateString())
      );
      if (uniqueDays.size < criteria.daysActive) return false;
    }

    // Consecutive days (simplified - checks if played in last N days)
    if (criteria.consecutiveDays !== undefined) {
      const now = new Date();
      const lastNDays = [];
      for (let i = 0; i < criteria.consecutiveDays; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        lastNDays.push(date.toDateString());
      }
      
      const playedDays = new Set(
        userProgress
          .filter(p => lastNDays.includes(new Date((p as any).createdAt).toDateString()))
          .map(p => new Date((p as any).createdAt).toDateString())
      );
      
      if (playedDays.size < criteria.consecutiveDays) return false;
    }

    // Completion rate
    if (criteria.completionRate !== undefined) {
      if (userProgress.length === 0) return false;
      const completedGames = userProgress.filter(p => p.isCompleted).length;
      const rate = (completedGames / userProgress.length) * 100;
      if (rate < criteria.completionRate) return false;
    }

    return true;
  }

  async getUserAchievements(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return this.userAchievementModel
      .find({ userId: userObjectId })
      .populate('achievementId')
      .sort({ unlockedAt: -1 });
  }

  async getAchievementStats(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const userAchievements = await this.userAchievementModel.find({ userId: userObjectId });
    const allAchievements = await this.achievementModel.find({});
    const totalPoints = userAchievements.reduce((sum, a) => sum + (a.achievementId as any).pointsReward, 0);

    return {
      unlockedCount: userAchievements.length,
      totalAchievements: allAchievements.length,
      totalPoints,
      completionPercentage: Math.round((userAchievements.length / allAchievements.length) * 100),
      achievements: userAchievements
    };
  }

  async getAllAchievements(userId?: string) {
    const allAchievements = await this.achievementModel.find({}).sort({ difficulty: 1 });
    
    if (!userId) {
      return allAchievements;
    }

    const userObjectId = new Types.ObjectId(userId);
    const unlockedAchievements = await this.userAchievementModel.find({ userId: userObjectId });
    const unlockedIds = unlockedAchievements.map(ua => ua.achievementId.toString());

    return allAchievements.map(achievement => ({
      ...achievement.toObject(),
      isUnlocked: unlockedIds.includes(achievement._id.toString()),
      unlockedAt: unlockedAchievements.find(ua => ua.achievementId.equals(achievement._id))?.unlockedAt
    }));
  }
}
