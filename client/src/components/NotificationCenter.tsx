import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Trash2, Settings, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";

interface WebSocketMessage {
  type: string;
  data?: Notification;
  userId?: string;
  timestamp?: string;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch initial notifications
  const { data: initialNotifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Fallback polling every 30 seconds
  });

  // Update notifications when data changes
  useEffect(() => {
    if (initialNotifications) {
      setNotifications(initialNotifications);
      setUnreadCount(initialNotifications.filter((n: Notification) => !n.isRead).length);
    }
  }, [initialNotifications]);

  // WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Authenticate with user ID
        wsRef.current?.send(JSON.stringify({
          type: 'authenticate',
          userId: user.id
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', message);

          switch (message.type) {
            case 'authenticated':
              console.log('WebSocket authenticated for user:', message.userId);
              break;

            case 'notification':
              if (message.data) {
                handleNewNotification(message.data);
              }
              break;

            default:
              console.log('Unknown WebSocket message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated, user]);

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      duration: 5000,
    });

    // Play notification sound (optional)
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(console.warn);
    } catch (error) {
      // Ignore audio errors
    }
  };

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: (_, notificationId) => {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive",
      });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/notifications/read-all");
    },
    onSuccess: () => {
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de marquer toutes les notifications comme lues",
        variant: "destructive",
      });
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("DELETE", `/api/notifications/${notificationId}`);
    },
    onSuccess: (_, notificationId) => {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.isRead ? prev - 1 : prev;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive",
      });
    },
  });

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {isConnected && (
            <div className="absolute -bottom-1 -right-1">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            </div>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </SheetTitle>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'En temps réel' : 'Hors ligne'}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    !notification.isRead
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      {!notification.isRead && (
                        <div className={`h-2 w-2 rounded-full ${getPriorityColor(notification.priority || 'normal')}`} />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatTimeAgo(notification.createdAt!)}</span>
                    <Badge variant="outline" className="text-xs">
                      {notification.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default NotificationCenter;