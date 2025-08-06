import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/i18n";
import { 
  Bell, 
  CreditCard, 
  Shield, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  X, 
  Trash2,
  CheckCheck
} from "lucide-react";

export function NotificationCenter() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'payment' | 'security'>('all');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest('PATCH', `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest('PATCH', '/api/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest('DELETE', `/api/notifications/${notificationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      notifications: {
        fr: "Notifications",
        en: "Notifications", 
        es: "Notificaciones",
        ar: "الإشعارات"
      },
      all: {
        fr: "Toutes",
        en: "All",
        es: "Todas", 
        ar: "الكل"
      },
      unread: {
        fr: "Non lues",
        en: "Unread",
        es: "No leídas",
        ar: "غير مقروءة"
      },
      payment: {
        fr: "Paiements",
        en: "Payments",
        es: "Pagos",
        ar: "المدفوعات"
      },
      security: {
        fr: "Sécurité", 
        en: "Security",
        es: "Seguridad",
        ar: "الأمان"
      },
      markAllRead: {
        fr: "Tout marquer comme lu",
        en: "Mark all as read",
        es: "Marcar todo como leído",
        ar: "تحديد الكل كمقروء"
      },
      noNotifications: {
        fr: "Aucune notification",
        en: "No notifications", 
        es: "Sin notificaciones",
        ar: "لا توجد إشعارات"
      },
      noNotificationsDesc: {
        fr: "Vous êtes à jour avec toutes vos notifications",
        en: "You're all caught up with your notifications",
        es: "Estás al día con todas tus notificaciones",
        ar: "لقد قرأت جميع إشعاراتك"
      }
    };
    return texts[key]?.[language] || texts[key]?.['fr'] || key;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
      case 'payment_sent':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />;
      case 'security':
        return <Shield className="h-5 w-5 text-amber-600" />;
      case 'card':
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'payment':
      case 'payment_sent':
        return 'default';
      case 'security':
        return 'destructive';
      case 'card':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredNotifications = notifications.filter((notification: any) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6" />
          <h2 className="text-xl font-semibold">{getText('notifications')}</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            {getText('markAllRead')}
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{getText('all')}</TabsTrigger>
          <TabsTrigger value="unread">
            {getText('unread')}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payment">{getText('payment')}</TabsTrigger>
          <TabsTrigger value="security">{getText('security')}</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{getText('noNotifications')}</h3>
                <p className="text-muted-foreground text-center">
                  {getText('noNotificationsDesc')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification: any) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all hover:shadow-md ${
                    !notification.isRead ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-sm">
                                {notification.title}
                              </h4>
                              <Badge 
                                variant={getNotificationBadgeColor(notification.type)}
                                className="text-xs"
                              >
                                {getText(notification.type)}
                              </Badge>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsReadMutation.mutate(notification.id)}
                                disabled={markAsReadMutation.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotificationMutation.mutate(notification.id)}
                              disabled={deleteNotificationMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}