'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
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

interface AlertCenterProps {
  alerts: Alert[];
  onRefresh: () => void;
  language?: 'en' | 'ar';
}

const severityConfig = {
  high: {
    color: 'bg-red-50 border-red-500 text-red-800',
    icon: AlertTriangle,
    badge: 'bg-red-100 text-red-800',
  },
  medium: {
    color: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    icon: AlertTriangle,
    badge: 'bg-yellow-100 text-yellow-800',
  },
  low: {
    color: 'bg-blue-50 border-blue-500 text-blue-800',
    icon: Info,
    badge: 'bg-blue-100 text-blue-800',
  },
};

export function AlertCenter({ alerts, onRefresh, language = 'en' }: AlertCenterProps) {
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      setMarkingAsRead(alertId);
      await alertsAPI.markAsRead(alertId);
      onRefresh();
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Alert Center</CardTitle>
            <CardDescription>
              Safety alerts and notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">No alerts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;

              return (
                <div
                  key={alert._id}
                  className={`p-4 rounded-lg border-l-4 ${config.color} ${
                    !alert.isRead ? 'ring-2 ring-offset-2 ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5" />
                        <h4 className="font-semibold">
                          {language === 'ar' && alert.titleArabic ? alert.titleArabic : alert.title}
                        </h4>
                        <Badge className={config.badge}>{alert.severity}</Badge>
                        {!alert.isRead && (
                          <Badge variant="outline" className="bg-white">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mt-2 whitespace-pre-wrap">
                        {language === 'ar' && alert.messageArabic ? alert.messageArabic : alert.message}
                      </p>
                      {alert.metadata && (
                        <div className="mt-2 text-xs text-gray-600">
                          {alert.metadata.detectedAt && (
                            <p>Detected: {new Date(alert.metadata.detectedAt).toLocaleString()}</p>
                          )}
                          {alert.metadata.totalMinutes && (
                            <p>Screen time: {alert.metadata.totalMinutes} minutes</p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!alert.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(alert._id)}
                        disabled={markingAsRead === alert._id}
                      >
                        {markingAsRead === alert._id ? 'Marking...' : 'Mark as read'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

