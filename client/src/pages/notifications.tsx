import { useState } from "react";
import { Bell, Settings, Trash2, Check, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Notification, NotificationPreferences } from "@shared/schema";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const { user, isAuthenticated } = useAuth();
  const { isConnected, sendTestNotification, isTestPending } = useNotifications();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
  });

  // Fetch notification preferences
  const { data: preferences } = useQuery({
    queryKey: ["/api/notification-preferences"],
    enabled: isAuthenticated,
  });

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (activeTab === 'unread') return !notification.isRead;
    return true;
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues",
      });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("DELETE", `/api/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      await apiRequest("PATCH", "/api/notification-preferences", newPreferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
      toast({
        title: "Préférences mises à jour",
        description: "Vos préférences de notification ont été sauvegardées",
      });
    },
  });

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}j`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction': return '💰';
      case 'security': return '🔒';
      case 'system': return '📢';
      case 'promo': return '🎉';
      default: return '📬';
    }
  };

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Vous devez être connecté pour voir vos notifications.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos notifications et préférences
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <div className="flex items-center gap-2 text-sm">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Temps réel' : 'Hors ligne'}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={sendTestNotification}
            disabled={isTestPending}
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-muted rounded-lg">
        <Button
          variant={activeTab === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('all')}
          className="flex-1"
        >
          Toutes
          <Badge variant="secondary" className="ml-2">
            {notifications.length}
          </Badge>
        </Button>
        <Button
          variant={activeTab === 'unread' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('unread')}
          className="flex-1"
        >
          Non lues
          <Badge variant="secondary" className="ml-2">
            {unreadCount}
          </Badge>
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('settings')}
          className="flex-1"
        >
          <Settings className="h-4 w-4 mr-2" />
          Paramètres
        </Button>
      </div>

      {activeTab === 'settings' ? (
        <Card>
          <CardHeader>
            <CardTitle>Préférences de notification</CardTitle>
            <CardDescription>
              Configurez comment vous souhaitez recevoir vos notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications de transaction</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications pour tous les transferts
                </p>
              </div>
              <Switch
                checked={preferences?.transactionAlerts ?? true}
                onCheckedChange={(checked) =>
                  updatePreferencesMutation.mutate({ transactionAlerts: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertes de sécurité</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications importantes sur la sécurité de votre compte
                </p>
              </div>
              <Switch
                checked={preferences?.securityAlerts ?? true}
                onCheckedChange={(checked) =>
                  updatePreferencesMutation.mutate({ securityAlerts: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Promotions et nouvelles fonctionnalités
                </p>
              </div>
              <Switch
                checked={preferences?.marketingNotifications ?? false}
                onCheckedChange={(checked) =>
                  updatePreferencesMutation.mutate({ marketingNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications push</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications dans le navigateur
                </p>
              </div>
              <Switch
                checked={preferences?.pushNotifications ?? true}
                onCheckedChange={(checked) =>
                  updatePreferencesMutation.mutate({ pushNotifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {activeTab === 'all' ? 'Toutes les notifications' : 'Notifications non lues'}
              </CardTitle>
              {unreadCount > 0 && activeTab !== 'settings' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Tout marquer lu
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-muted-foreground mt-2">Chargement...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">
                  {activeTab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                </p>
                <p className="text-muted-foreground">
                  {activeTab === 'unread' 
                    ? 'Toutes vos notifications ont été lues' 
                    : 'Vos notifications apparaîtront ici'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all ${
                      !notification.isRead
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
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
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                      <span>{formatTimeAgo(notification.createdAt!)}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{notification.type}</Badge>
                        {notification.priority && notification.priority !== 'normal' && (
                          <Badge 
                            variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}
                          >
                            {notification.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}