import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Alert, AlertDocument, AlertType, AlertSeverity } from '../schemas/alert.schema';
import { UsersService } from '../users/users.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import { UserDocument, UserRole } from '../schemas/user.schema';

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    private usersService: UsersService,
    private monitoringService: MonitoringService,
  ) {}

  async createAlert(
    userId: string,
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    message: string,
    titleArabic?: string,
    messageArabic?: string,
    metadata?: Record<string, any>,
  ): Promise<AlertDocument> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const alert = new this.alertModel({
      userId: new Types.ObjectId(userId),
      parentId: user.parentId ? new Types.ObjectId(user.parentId) : undefined,
      type,
      severity,
      title,
      message,
      titleArabic,
      messageArabic,
      metadata,
    });

    await alert.save();
    return alert;
  }

  async detectCyberbullying(userId: string, content: string): Promise<AlertDocument | null> {
    // Enhanced keyword-based detection with pattern recognition
    const cyberbullyingKeywords = [
      'stupid', 'idiot', 'loser', 'hate', 'ugly', 'dumb', 'worthless', 'pathetic',
      'kill yourself', 'die', 'nobody likes you', 'you suck',
      'غبي', 'أحمق', 'فاشل', 'أكرهك', 'قبيح', 'مات', 'انتحر',
    ];

    const threatKeywords = [
      'kill', 'die', 'hurt', 'harm', 'threat', 'violence',
      'قتل', 'موت', 'أذى', 'تهديد',
    ];

    const lowerContent = content.toLowerCase();
    
    // Count occurrences
    let keywordCount = 0;
    let threatCount = 0;
    
    cyberbullyingKeywords.forEach((keyword) => {
      if (lowerContent.includes(keyword)) {
        keywordCount++;
      }
    });

    threatKeywords.forEach((keyword) => {
      if (lowerContent.includes(keyword)) {
        threatCount++;
      }
    });

    // Pattern detection: rapid messaging, repeated keywords
    const hasPattern = keywordCount >= 2 || threatCount >= 1;

    if (hasPattern) {
      const severity = threatCount > 0 ? AlertSeverity.HIGH : 
                       keywordCount >= 3 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM;

      const educationalMessage = threatCount > 0
        ? 'We detected threatening language. This is serious. Please talk to a trusted adult immediately. Remember: it\'s never okay to threaten or hurt others, and if someone threatens you, tell an adult right away.'
        : 'We noticed some unkind words. Being online is like being in person - we should always be respectful and kind. If someone is being mean to you, tell a trusted adult. And remember, words can hurt, so let\'s use them to build others up, not tear them down!';

      const educationalMessageArabic = threatCount > 0
        ? 'لقد اكتشفنا لغة تهديدية. هذا أمر خطير. يرجى التحدث إلى شخص بالغ تثق به على الفور. تذكر: لا يجوز أبدًا تهديد الآخرين أو إيذائهم، وإذا هددك شخص ما، أخبر شخصًا بالغًا على الفور.'
        : 'لاحظنا بعض الكلمات غير اللطيفة. التواجد على الإنترنت يشبه التواجد شخصيًا - يجب أن نكون دائمًا محترمين ولطيفين. إذا كان شخص ما قاسيًا معك، أخبر شخصًا بالغًا تثق به. وتذكر، الكلمات يمكن أن تؤذي، لذا دعنا نستخدمها لبناء الآخرين، وليس لهدمهم!';

      return this.createAlert(
        userId,
        AlertType.CYBERBULLYING,
        severity,
        'Cyberbullying Detected',
        educationalMessage,
        'تم اكتشاف تنمر إلكتروني',
        educationalMessageArabic,
        { 
          content, 
          detectedAt: new Date(),
          keywordCount,
          threatCount,
          pattern: hasPattern ? 'repeated_keywords' : 'single_keyword',
        },
      );
    }

    return null;
  }

  async detectInappropriateContent(userId: string, content: string): Promise<AlertDocument | null> {
    // Simple keyword-based detection
    const inappropriateKeywords = [
      'violence', 'weapon', 'drug', 'alcohol',
      'عنف', 'سلاح', 'مخدرات',
    ];

    const lowerContent = content.toLowerCase();
    const detected = inappropriateKeywords.some((keyword) => lowerContent.includes(keyword));

    if (detected) {
      return this.createAlert(
        userId,
        AlertType.INAPPROPRIATE_CONTENT,
        AlertSeverity.MEDIUM,
        'Inappropriate Content Warning',
        'This content may not be suitable for your age. Always ask a parent or teacher if you\'re unsure about something online.',
        'تحذير من محتوى غير مناسب',
        'قد لا يكون هذا المحتوى مناسبًا لعمرك. اسأل دائمًا أحد الوالدين أو المعلم إذا كنت غير متأكد من شيء على الإنترنت.',
        { content, detectedAt: new Date() },
      );
    }

    return null;
  }

  async checkExcessiveGaming(userId: string): Promise<AlertDocument | null> {
    const user = await this.usersService.findById(userId);
    if (!user) return null;

    const screenTimeData = await this.monitoringService.getScreenTime(
      userId,
      { range: 'day' as any },
      user,
    );

    // Get activity log to analyze patterns
    const activities = await this.monitoringService.getActivityLog(
      userId,
      { range: 'day' as any },
      user,
    );

    const gameActivities = activities.filter((a) => a.type === 'game_played' as any);
    const totalGameTime = gameActivities.reduce((sum, a) => sum + a.duration, 0);
    const gameMinutes = Math.floor(totalGameTime / 60);

    // Age-appropriate limits
    const ageLimits: Record<string, number> = {
      '3-5': 30,   // 30 minutes
      '6-8': 60,   // 1 hour
      '9-12': 120, // 2 hours
    };

    const userAgeGroup = user.ageGroup || '9-12';
    const maxMinutes = ageLimits[userAgeGroup] || 120;

    // Check for excessive gaming patterns
    let alertType: AlertType = AlertType.EXCESSIVE_GAMING;
    let severity: AlertSeverity = AlertSeverity.MEDIUM;
    let title = 'Screen Time Reminder';
    let message = '';
    let titleArabic = 'تذكير بوقت الشاشة';
    let messageArabic = '';

    // Pattern 1: Exceeded daily limit
    if (screenTimeData.totalMinutes > maxMinutes) {
      severity = screenTimeData.totalMinutes > maxMinutes * 1.5 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM;
      message = `You've been playing for ${screenTimeData.totalMinutes} minutes today, which is more than your recommended limit of ${maxMinutes} minutes. `;
      message += 'Remember: taking breaks helps your brain rest and makes gaming more fun! Try doing something else for a while - read a book, play outside, or help with a chore.';
      
      messageArabic = `لقد لعبت لمدة ${screenTimeData.totalMinutes} دقيقة اليوم، وهو أكثر من الحد الموصى به وهو ${maxMinutes} دقيقة. `;
      messageArabic += 'تذكر: أخذ الاستراحات يساعد دماغك على الراحة ويجعل اللعب أكثر متعة! جرب القيام بشيء آخر لفترة - اقرأ كتابًا، أو العب في الخارج، أو ساعد في مهمة.';
    }
    // Pattern 2: Long continuous session (>2 hours)
    else if (gameActivities.length > 0) {
      const longestSession = Math.max(...gameActivities.map(a => a.duration));
      const longestSessionMinutes = Math.floor(longestSession / 60);
      
      if (longestSessionMinutes > 120) {
        severity = AlertSeverity.MEDIUM;
        message = `You've been playing for ${longestSessionMinutes} minutes without a break! `;
        message += 'Your eyes and brain need rest. Try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. This helps keep your eyes healthy!';
        
        messageArabic = `لقد لعبت لمدة ${longestSessionMinutes} دقيقة دون استراحة! `;
        messageArabic += 'عيونك ودماغك يحتاجان للراحة. جرب قاعدة 20-20-20: كل 20 دقيقة، انظر إلى شيء على بعد 20 قدمًا لمدة 20 ثانية. هذا يساعد في الحفاظ على صحة عينيك!';
      }
      // Pattern 3: Multiple sessions in one day
      else if (gameActivities.length > 5) {
        severity = AlertSeverity.LOW;
        message = `You've played ${gameActivities.length} times today! `;
        message += 'That\'s a lot of gaming. Remember to balance your time - try mixing in some other fun activities like drawing, reading, or playing outside!';
        
        messageArabic = `لقد لعبت ${gameActivities.length} مرات اليوم! `;
        messageArabic += 'هذا كثير من الألعاب. تذكر أن توازن وقتك - جرب مزج بعض الأنشطة الممتعة الأخرى مثل الرسم أو القراءة أو اللعب في الخارج!';
      }
    }

    // Pattern 4: Late night gaming
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 21 && gameActivities.length > 0) {
      const lastActivity = gameActivities[0];
      const lastActivityHour = new Date(lastActivity.timestamp).getHours();
      if (lastActivityHour >= 21) {
        severity = AlertSeverity.MEDIUM;
        message = 'It\'s getting late! Playing games late at night can make it hard to sleep. Your body needs rest to grow strong and healthy. Try winding down with a book or quiet activity instead.';
        messageArabic = 'أصبح الوقت متأخرًا! لعب الألعاب في وقت متأخر من الليل يمكن أن يجعل النوم صعبًا. جسمك يحتاج للراحة لينمو قويًا وصحيًا. جرب الاسترخاء بقراءة كتاب أو نشاط هادئ بدلاً من ذلك.';
      }
    }

    if (message) {
      return this.createAlert(
        userId,
        alertType,
        severity,
        title,
        message,
        titleArabic,
        messageArabic,
        { 
          totalMinutes: screenTimeData.totalMinutes,
          gameMinutes,
          sessionCount: gameActivities.length,
          date: new Date(),
          ageGroup: userAgeGroup,
          limit: maxMinutes,
        },
      );
    }

    return null;
  }

  async getUserAlerts(
    userId: string,
    requester: UserDocument,
    unreadOnly: boolean = false,
  ): Promise<AlertDocument[]> {
    // Check permissions
    if (requester.role === UserRole.CHILD && requester._id.toString() !== userId) {
      throw new ForbiddenException('You can only view your own alerts');
    }

    if (requester.role === UserRole.PARENT) {
      const children = await this.usersService.getChildren(requester._id.toString());
      const childIds = children.map((c) => c._id.toString());
      if (!childIds.includes(userId) && requester._id.toString() !== userId) {
        throw new ForbiddenException('You can only view your children\'s alerts');
      }
    }

    const query: any = { userId: new Types.ObjectId(userId) };
    if (unreadOnly) {
      query.isRead = false;
    }

    return this.alertModel.find(query).sort({ createdAt: -1 });
  }

  async getParentAlerts(parentId: string): Promise<AlertDocument[]> {
    const children = await this.usersService.getChildren(parentId);
    const childIds = children.map((c) => c._id.toString());

    return this.alertModel
      .find({
        parentId: new Types.ObjectId(parentId),
        isRead: false,
      })
      .populate('userId')
      .sort({ createdAt: -1 });
  }

  async markAsRead(alertId: string, userId: string): Promise<AlertDocument> {
    const alert = await this.alertModel.findOne({
      _id: new Types.ObjectId(alertId),
      $or: [
        { userId: new Types.ObjectId(userId) },
        { parentId: new Types.ObjectId(userId) },
      ],
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.isRead = true;
    alert.readAt = new Date();
    await alert.save();

    return alert;
  }

  async createPositiveAlert(
    userId: string,
    title: string,
    message: string,
    titleArabic?: string,
    messageArabic?: string,
  ): Promise<AlertDocument> {
    return this.createAlert(
      userId,
      AlertType.POSITIVE_BEHAVIOR,
      AlertSeverity.LOW,
      title,
      message,
      titleArabic,
      messageArabic,
    );
  }

  async createCyberbullyingAlert(
    userId: string | Types.ObjectId,
    type: string,
    severity: string,
    title: string,
    message: string,
    relatedData?: Record<string, any>,
  ): Promise<AlertDocument> {
    // Convert severity string to AlertSeverity enum
    const severityMap = {
      low: AlertSeverity.LOW,
      medium: AlertSeverity.MEDIUM,
      high: AlertSeverity.HIGH,
      critical: AlertSeverity.HIGH, // Map critical to high for now
    };

    const mappedSeverity = severityMap[severity] || AlertSeverity.MEDIUM;

    return this.createAlert(
      userId.toString(),
      AlertType.CYBERBULLYING,
      mappedSeverity,
      title,
      message,
      undefined,
      undefined,
      relatedData,
    );
  }
}

