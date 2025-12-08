'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { AlertTriangle, Info, BookOpen, X, CheckCircle } from 'lucide-react';
import { alertsAPI } from '@/src/lib/api';

interface Alert {
  _id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  titleArabic?: string;
  messageArabic?: string;
  isRead: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

interface SafetyAlertProps {
  alert: Alert;
  language?: 'en' | 'ar';
  onDismiss?: () => void;
}

const safetyTips: Record<string, { en: string; ar: string }> = {
  cyberbullying: {
    en: '💡 Safety Tip: If someone is being mean online, tell a trusted adult. Remember, being kind makes the internet a better place for everyone!',
    ar: '💡 نصيحة أمان: إذا كان شخص ما قاسيًا على الإنترنت، أخبر شخصًا بالغًا تثق به. تذكر، كونك لطيفًا يجعل الإنترنت مكانًا أفضل للجميع!',
  },
  inappropriate_content: {
    en: '💡 Safety Tip: If you see something that makes you uncomfortable, close it and tell a parent or teacher. They can help you understand and stay safe!',
    ar: '💡 نصيحة أمان: إذا رأيت شيئًا يجعلك غير مرتاح، أغلقها وأخبر أحد الوالدين أو المعلم. يمكنهم مساعدتك على الفهم والبقاء آمنًا!',
  },
  excessive_gaming: {
    en: '💡 Safety Tip: Taking breaks helps your brain rest and makes gaming more fun! Try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.',
    ar: '💡 نصيحة أمان: أخذ الاستراحات يساعد دماغك على الراحة ويجعل اللعب أكثر متعة! جرب قاعدة 20-20-20: كل 20 دقيقة، انظر إلى شيء على بعد 20 قدمًا لمدة 20 ثانية.',
  },
};

export function SafetyAlert({ alert, language = 'en', onDismiss }: SafetyAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    // Auto-dismiss low severity alerts after 10 seconds
    if (alert.severity === 'low' && !alert.isRead) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleDismiss = async () => {
    if (alert.isRead) return;

    try {
      await alertsAPI.markAsRead(alert._id);
      setIsDismissed(true);
      if (onDismiss) {
        onDismiss();
      }
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  if (isDismissed) return null;

  const severityColors = {
    high: 'bg-red-50 border-red-500 text-red-800',
    medium: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    low: 'bg-blue-50 border-blue-500 text-blue-800',
  };

  const tip = safetyTips[alert.type] || {
    en: '💡 Remember: Stay safe online and always ask for help if you need it!',
    ar: '💡 تذكر: ابق آمنًا على الإنترنت واطلب المساعدة دائمًا إذا كنت بحاجة إليها!',
  };

  return (
    <Card className={`border-l-4 ${severityColors[alert.severity]} mb-4 shadow-lg`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {alert.severity === 'high' ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <Info className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              {language === 'ar' && alert.titleArabic ? alert.titleArabic : alert.title}
            </h3>
            <p className="text-sm mb-3 whitespace-pre-wrap">
              {language === 'ar' && alert.messageArabic ? alert.messageArabic : alert.message}
            </p>
            
            {showTip && (
              <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    {language === 'ar' ? tip.ar : tip.en}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="text-sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {language === 'ar' ? 'فهمت' : 'Got it!'}
              </Button>
              {alert.severity === 'high' && (
                <span className="text-xs text-gray-600">
                  {language === 'ar' ? 'يرجى إخبار شخص بالغ' : 'Please tell an adult'}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTip(!showTip)}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

