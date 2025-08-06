import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { initializeNotificationService, getNotificationService } from "./notificationService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Cards API
  app.get("/api/cards", async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const cards = await storage.getUserCards(userId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  app.patch("/api/cards/:cardId", async (req, res) => {
    try {
      const { cardId } = req.params;
      const { settings } = req.body;
      const userId = req.user?.claims?.sub;
      
      const card = await storage.updateCardSettings(cardId, userId, settings);
      res.json(card);
    } catch (error) {
      console.error("Error updating card settings:", error);
      res.status(500).json({ message: "Failed to update card settings" });
    }
  });

  // Notifications API
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:notificationId/read", async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.claims?.sub;
      
      await storage.markNotificationAsRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/read-all", async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:notificationId", async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.claims?.sub;
      
      await storage.deleteNotification(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Registered Operators API
  app.get("/api/registered-operators", async (req, res) => {
    try {
      const operators = await storage.getRegisteredOperators();
      res.json(operators);
    } catch (error) {
      console.error("Error fetching registered operators:", error);
      res.status(500).json({ message: "Failed to fetch registered operators" });
    }
  });

  // Mobile Money Accounts API
  app.get("/api/mobile-money-accounts", async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const accounts = await storage.getUserMobileMoneyAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching mobile money accounts:", error);
      res.status(500).json({ message: "Failed to fetch mobile money accounts" });
    }
  });

  // Instant Transfer API
  app.post("/api/instant-transfer", async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const transferData = {
        ...req.body,
        fromUserId: userId,
        status: 'completed',
        fees: '500.00'
      };
      
      const result = await storage.createInstantTransfer(transferData);
      res.json(result);
    } catch (error) {
      console.error("Error creating instant transfer:", error);
      res.status(500).json({ message: "Failed to create instant transfer" });
    }
  });

  // Contacts API
  app.get("/api/contacts/frequent", async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const contacts = await storage.getFrequentContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching frequent contacts:", error);
      res.status(500).json({ message: "Failed to fetch frequent contacts" });
    }
  });

  // Transactions API
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Admin routes (temporarily unprotected for testing)
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/admin/kyc/pending", async (req, res) => {
    try {
      const pendingKYC = await storage.getPendingKYCDocuments();
      res.json(pendingKYC);
    } catch (error) {
      console.error("Error fetching pending KYC:", error);
      res.status(500).json({ message: "Failed to fetch pending KYC documents" });
    }
  });

  app.put("/api/admin/kyc/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      const { status, rejectionReason } = req.body;
      
      const updatedDocument = await storage.updateKycDocumentStatus(documentId, status, rejectionReason);
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error updating KYC document:", error);
      res.status(500).json({ message: "Failed to update KYC document" });
    }
  });

  app.put("/api/admin/users/:userId/suspend", async (req, res) => {
    try {
      const { userId } = req.params;
      const { suspend } = req.body;
      
      await storage.suspendUser(userId, suspend);
      res.json({ success: true, suspended: suspend });
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  app.get("/api/admin/export/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const csvData = await storage.exportData(type);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // New Admin Routes - User Creation
  app.post('/api/admin/users', async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Roles Management
  app.get('/api/admin/roles', async (req, res) => {
    try {
      const roles = await storage.getUserRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.post('/api/admin/roles', async (req, res) => {
    try {
      const role = await storage.createUserRole(req.body);
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  app.post('/api/admin/users/:userId/roles', async (req, res) => {
    try {
      const assignment = await storage.assignUserRole({
        userId: req.params.userId,
        roleId: req.body.roleId,
        assignedBy: req.user?.claims?.sub
      });
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error assigning role:", error);
      res.status(500).json({ message: "Failed to assign role" });
    }
  });

  app.get('/api/admin/users/:userId/roles', async (req, res) => {
    try {
      const assignments = await storage.getUserRoleAssignments(req.params.userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  // Transfer Fees Management
  app.get('/api/admin/transfer-fees', async (req, res) => {
    try {
      const fees = await storage.getTransferFees();
      res.json(fees);
    } catch (error) {
      console.error("Error fetching transfer fees:", error);
      res.status(500).json({ message: "Failed to fetch transfer fees" });
    }
  });

  app.post('/api/admin/transfer-fees', async (req, res) => {
    try {
      const fee = await storage.createTransferFee(req.body);
      res.status(201).json(fee);
    } catch (error) {
      console.error("Error creating transfer fee:", error);
      res.status(500).json({ message: "Failed to create transfer fee" });
    }
  });

  app.put('/api/admin/transfer-fees/:feeId', async (req, res) => {
    try {
      const updatedFee = await storage.updateTransferFee(req.params.feeId, req.body);
      res.json(updatedFee);
    } catch (error) {
      console.error("Error updating transfer fee:", error);
      res.status(500).json({ message: "Failed to update transfer fee" });
    }
  });

  // Operation Profits
  app.get('/api/admin/profits', async (req, res) => {
    try {
      const profits = await storage.getOperationProfits(50);
      res.json(profits);
    } catch (error) {
      console.error("Error fetching profits:", error);
      res.status(500).json({ message: "Failed to fetch profits" });
    }
  });

  app.get('/api/admin/profits/by-operation', async (req, res) => {
    try {
      const profits = await storage.getProfitsByOperationType();
      res.json(profits);
    } catch (error) {
      console.error("Error fetching profits by operation:", error);
      res.status(500).json({ message: "Failed to fetch profits by operation" });
    }
  });

  app.get('/api/admin/profits/trends', async (req, res) => {
    try {
      const trends = await storage.getMonthlyProfitTrends();
      res.json(trends);
    } catch (error) {
      console.error("Error fetching profit trends:", error);
      res.status(500).json({ message: "Failed to fetch profit trends" });
    }
  });

  // Operation Analytics
  app.get('/api/admin/analytics', async (req, res) => {
    try {
      const operationType = req.query.type as string;
      const analytics = await storage.getOperationAnalytics(operationType, 30);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Multi-Currency routes (temporarily without authentication for testing)
  app.get('/api/currencies', async (req, res) => {
    try {
      const currencies = await storage.getAllCurrencies();
      res.json(currencies);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      res.status(500).json({ message: "Failed to fetch currencies" });
    }
  });

  app.get('/api/exchange-rates/all', async (req, res) => {
    try {
      const rates = await storage.getAllExchangeRates();
      res.json(rates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      res.status(500).json({ message: "Failed to fetch exchange rates" });
    }
  });

  app.get('/api/multi-currency-accounts', async (req, res) => {
    try {
      // Use authenticated user ID if available, otherwise use a test ID
      const userId = req.user?.claims?.sub || '45976179';
      const accounts = await storage.getUserMultiCurrencyAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching multi-currency accounts:", error);
      res.status(500).json({ message: "Failed to fetch multi-currency accounts" });
    }
  });

  app.post('/api/multi-currency-accounts', async (req, res) => {
    try {
      // Use authenticated user ID if available, otherwise use a test ID
      const userId = req.user?.claims?.sub || '45976179';
      const accountData = { ...req.body, userId };
      const account = await storage.createMultiCurrencyAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating multi-currency account:", error);
      res.status(500).json({ message: "Failed to create multi-currency account" });
    }
  });

  // Notification routes
  app.get('/api/notifications', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:notificationId/read', async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.claims?.sub;
      
      await storage.markNotificationAsRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch('/api/notifications/read-all', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete('/api/notifications/:notificationId', async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.claims?.sub;
      
      await storage.deleteNotification(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Notification preferences
  app.get('/api/notification-preferences', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const preferences = await storage.getUserNotificationPreferences(userId);
      res.json(preferences || {});
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  app.patch('/api/notification-preferences', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const preferences = await storage.updateNotificationPreferences(userId, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // Test notification endpoint (for development)
  app.post('/api/test-notification', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const notificationService = getNotificationService();
      
      if (notificationService) {
        await notificationService.sendTransactionNotification(
          userId,
          'received',
          '1000',
          'FCFA',
          'Test User'
        );
        res.json({ success: true, message: 'Test notification sent' });
      } else {
        res.status(503).json({ message: 'Notification service not available' });
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket notification service
  initializeNotificationService(httpServer);
  console.log('Real-time notification service initialized');
  
  return httpServer;
}