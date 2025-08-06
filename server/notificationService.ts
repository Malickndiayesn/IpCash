import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { storage } from "./storage";
import type { Notification, InsertNotification } from "@shared/schema";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
}

export class NotificationService {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket[]> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: (info) => {
        // Basic verification - in production, verify JWT tokens
        return true;
      }
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('WebSocket server initialized for real-time notifications');
  }

  private handleConnection(ws: AuthenticatedWebSocket, request: any) {
    console.log('New WebSocket connection established');

    // Handle authentication message
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'authenticate' && message.userId) {
          ws.userId = message.userId;
          this.addClient(message.userId, ws);
          
          // Send connection confirmation
          ws.send(JSON.stringify({
            type: 'authenticated',
            userId: message.userId,
            timestamp: new Date().toISOString()
          }));

          // Send any undelivered notifications
          await this.sendUndeliveredNotifications(message.userId);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        this.removeClient(ws.userId, ws);
        console.log(`WebSocket client disconnected: ${ws.userId}`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  }

  private addClient(userId: string, ws: AuthenticatedWebSocket) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)!.push(ws);
    console.log(`Added WebSocket client for user: ${userId}`);
  }

  private removeClient(userId: string, ws: AuthenticatedWebSocket) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const index = userClients.indexOf(ws);
      if (index !== -1) {
        userClients.splice(index, 1);
      }
      if (userClients.length === 0) {
        this.clients.delete(userId);
      }
    }
  }

  // Send notification to specific user
  public async sendNotificationToUser(userId: string, notification: Notification) {
    const userClients = this.clients.get(userId);
    
    if (userClients && userClients.length > 0) {
      const message = JSON.stringify({
        type: 'notification',
        data: notification
      });

      // Send to all user's connected devices
      const deliveryPromises = userClients
        .filter(client => client.readyState === WebSocket.OPEN)
        .map(client => {
          return new Promise<void>((resolve) => {
            client.send(message, (error) => {
              if (error) {
                console.error('Error sending notification:', error);
              }
              resolve();
            });
          });
        });

      await Promise.all(deliveryPromises);

      // Mark as delivered
      await storage.markNotificationAsDelivered(notification.id);
      
      console.log(`Notification sent to user ${userId}: ${notification.title}`);
      return true;
    }

    console.log(`User ${userId} not connected - notification will be delivered when they connect`);
    return false;
  }

  // Send notification to multiple users
  public async broadcastNotification(userIds: string[], notification: Omit<InsertNotification, 'userId'>) {
    const notifications: Notification[] = [];
    
    for (const userId of userIds) {
      const userNotification = await storage.createNotification({
        ...notification,
        userId
      });
      notifications.push(userNotification);
    }

    // Send to connected users
    for (const notif of notifications) {
      await this.sendNotificationToUser(notif.userId, notif);
    }

    return notifications;
  }

  // Create and send transaction notification
  public async sendTransactionNotification(
    userId: string, 
    transactionType: 'sent' | 'received' | 'failed', 
    amount: string, 
    currency: string = 'FCFA',
    recipientName?: string,
    transactionId?: string
  ) {
    const titles = {
      sent: `💸 Transfert envoyé`,
      received: `💰 Transfert reçu`,
      failed: `❌ Transfert échoué`
    };

    const messages = {
      sent: `Vous avez envoyé ${amount} ${currency}${recipientName ? ` à ${recipientName}` : ''}`,
      received: `Vous avez reçu ${amount} ${currency}${recipientName ? ` de ${recipientName}` : ''}`,
      failed: `Le transfert de ${amount} ${currency} a échoué`
    };

    const notification = await storage.createNotification({
      userId,
      type: 'transaction',
      title: titles[transactionType],
      message: messages[transactionType],
      priority: transactionType === 'failed' ? 'high' : 'normal',
      data: {
        transactionId,
        amount,
        currency,
        recipientName,
        transactionType
      }
    });

    await this.sendNotificationToUser(userId, notification);
    return notification;
  }

  // Send security notification
  public async sendSecurityNotification(
    userId: string,
    title: string,
    message: string,
    severity: 'low' | 'medium' | 'high' = 'medium'
  ) {
    const notification = await storage.createNotification({
      userId,
      type: 'security',
      title: `🔒 ${title}`,
      message,
      priority: severity === 'high' ? 'urgent' : severity === 'medium' ? 'high' : 'normal',
      data: { severity }
    });

    await this.sendNotificationToUser(userId, notification);
    return notification;
  }

  // Send undelivered notifications when user connects
  private async sendUndeliveredNotifications(userId: string) {
    const undelivered = await storage.getUndeliveredNotifications(userId);
    
    for (const notification of undelivered) {
      await this.sendNotificationToUser(userId, notification);
    }
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.clients.size;
  }

  // Get specific user connection status
  public isUserConnected(userId: string): boolean {
    const userClients = this.clients.get(userId);
    return !!(userClients && userClients.length > 0);
  }

  // Send system notification to all connected users
  public async sendSystemNotification(title: string, message: string, priority: string = 'normal') {
    const connectedUserIds = Array.from(this.clients.keys());
    
    if (connectedUserIds.length === 0) {
      console.log('No users connected for system notification');
      return;
    }

    await this.broadcastNotification(connectedUserIds, {
      type: 'system',
      title: `📢 ${title}`,
      message,
      priority
    });

    console.log(`System notification sent to ${connectedUserIds.length} connected users`);
  }
}

let notificationService: NotificationService | null = null;

export function initializeNotificationService(server: Server) {
  notificationService = new NotificationService(server);
  return notificationService;
}

export function getNotificationService(): NotificationService | null {
  return notificationService;
}