import { Injectable } from '@nestjs/common';

export interface TextAnalysisResult {
  isFlagged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  flaggedPhrases: string[];
}

@Injectable()
export class TextAnalysisService {
  // Inappropriate language patterns
  private readonly harshInsults = [
    'stupid',
    'dumb',
    'idiot',
    'fool',
    'loser',
    'pathetic',
    'worthless',
    'useless',
  ];

  private readonly threatPatterns = [
    'kill',
    'hurt',
    'beat',
    'punch',
    'threaten',
    'harm',
  ];

  private readonly mockingPatterns = [
    'you suck',
    'you\'re terrible',
    'you\'re bad at',
    'everyone laughs at you',
    'everyone hates you',
    'you\'re so bad',
    'lol at you',
    'lmao at you',
  ];

  private readonly exclusionPatterns = [
    'not your friend',
    'we don\'t like you',
    'nobody likes you',
    'get out',
    'leave',
    'we don\'t want you',
    'you\'re not welcome',
  ];

  private readonly harassingPatterns = [
    'stop playing',
    'quit the game',
    'get off',
    'leave me alone',
    'stop messaging',
    'don\'t talk to me',
  ];

  /**
   * Analyzes text content for cyberbullying indicators
   */
  analyzeText(content: string): TextAnalysisResult {
    const lowerContent = content.toLowerCase().trim();
    const flaggedPhrases: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const reasons: Set<string> = new Set();

    // Check for threats
    for (const pattern of this.threatPatterns) {
      if (lowerContent.includes(pattern)) {
        flaggedPhrases.push(pattern);
        reasons.add('Contains threatening language');
        maxSeverity = 'critical';
      }
    }

    // Check for harsh insults
    for (const insult of this.harshInsults) {
      if (lowerContent.includes(insult)) {
        flaggedPhrases.push(insult);
        reasons.add('Contains harsh insults');
        if (maxSeverity !== 'critical') maxSeverity = 'high';
      }
    }

    // Check for mocking patterns
    for (const pattern of this.mockingPatterns) {
      if (lowerContent.includes(pattern)) {
        flaggedPhrases.push(pattern);
        reasons.add('Contains mocking or belittling language');
        if (maxSeverity === 'low') maxSeverity = 'high';
      }
    }

    // Check for exclusion patterns
    for (const pattern of this.exclusionPatterns) {
      if (lowerContent.includes(pattern)) {
        flaggedPhrases.push(pattern);
        reasons.add('Contains exclusionary language');
        if (maxSeverity === 'low') maxSeverity = 'medium';
      }
    }

    // Check for harassment patterns
    for (const pattern of this.harassingPatterns) {
      if (lowerContent.includes(pattern)) {
        flaggedPhrases.push(pattern);
        reasons.add('Contains harassing language');
        if (maxSeverity === 'low') maxSeverity = 'medium';
      }
    }

    // Check for excessive capitalization (shouting)
    if (this.detectShouting(lowerContent, content)) {
      reasons.add('Excessive capitalization (aggressive tone)');
      if (maxSeverity === 'low') maxSeverity = 'low';
    }

    // Check for repeated negative messages in content
    if (this.detectIntensity(content)) {
      reasons.add('High intensity/aggressive tone');
      if (maxSeverity !== 'critical' && maxSeverity !== 'high')
        maxSeverity = 'medium';
    }

    return {
      isFlagged: flaggedPhrases.length > 0,
      severity: maxSeverity,
      reasons: Array.from(reasons),
      flaggedPhrases: [...new Set(flaggedPhrases)],
    };
  }

  /**
   * Detects if message is in "shouting" format (excessive capitals)
   */
  private detectShouting(lower: string, original: string): boolean {
    if (original.length < 5) return false;

    const words = original.split(' ').filter((w) => w.length > 0);
    if (words.length === 0) return false;

    const capsWords = words.filter((w) => w === w.toUpperCase()).length;
    return capsWords / words.length > 0.5; // More than 50% caps
  }

  /**
   * Detects high intensity/aggressive patterns
   */
  private detectIntensity(content: string): boolean {
    const exclamationCount = (content.match(/!/g) || []).length;
    const questionCount = (content.match(/\?/g) || []).length;
    const ellipsisCount = (content.match(/\.\.\./g) || []).length;

    const intensityScore =
      exclamationCount * 2 + questionCount * 1.5 + ellipsisCount * 1;

    return intensityScore > 4; // Threshold for high intensity
  }

  /**
   * Detects repetitive messaging to same user (harassment indicator)
   */
  detectRepetitiveMessaging(
    messageHistory: Array<{
      senderId: string;
      recipientId: string;
      timestamp: Date;
    }>,
    timeWindowMinutes: number = 30,
  ): { isRepetitive: boolean; messageCount: number } {
    const now = new Date();
    const windowStart = new Date(
      now.getTime() - timeWindowMinutes * 60 * 1000,
    );

    const recentMessages = messageHistory.filter(
      (msg) => msg.timestamp >= windowStart,
    );

    const messageCount = recentMessages.length;
    const isRepetitive = messageCount > 5; // More than 5 messages in short window

    return { isRepetitive, messageCount };
  }

  /**
   * Sanitizes text by removing flagged content
   */
  sanitizeText(content: string): string {
    let sanitized = content;

    for (const phrase of this.harshInsults) {
      const regex = new RegExp(phrase, 'gi');
      sanitized = sanitized.replace(regex, '***');
    }

    for (const phrase of this.mockingPatterns) {
      const regex = new RegExp(phrase, 'gi');
      sanitized = sanitized.replace(regex, '***');
    }

    return sanitized;
  }
}
