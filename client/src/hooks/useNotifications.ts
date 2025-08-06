import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";

interface WebSocketMessage {
  type: string;
  data?: Notification;
  userId?: string;
  timestamp?: string;
}

export function useNotifications() {
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log('Notification WebSocket connected');
        setIsConnected(true);
        
        // Authenticate with user ID
        websocket.send(JSON.stringify({
          type: 'authenticate',
          userId: user.id
        }));
      };

      websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'authenticated':
              console.log('WebSocket authenticated for user:', message.userId);
              break;

            case 'notification':
              if (message.data) {
                handleNewNotification(message.data);
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = () => {
        console.log('Notification WebSocket disconnected');
        setIsConnected(false);
        
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      setWs(websocket);
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [isAuthenticated, user?.id]);

  const handleNewNotification = (notification: Notification) => {
    // Invalidate notifications cache to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      duration: 4000,
    });

    // Play notification sound (optional)
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio errors - user might not have sound enabled
      });
    } catch (error) {
      // Ignore audio errors
    }
  };

  // Send test notification
  const sendTestNotification = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/test-notification");
    },
    onSuccess: () => {
      toast({
        title: "Test envoyé",
        description: "Une notification de test a été envoyée",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification de test",
        variant: "destructive",
      });
    },
  });

  return {
    isConnected,
    sendTestNotification: sendTestNotification.mutate,
    isTestPending: sendTestNotification.isPending,
  };
}