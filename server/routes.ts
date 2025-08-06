import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Cards API
  app.get("/api/cards", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const cards = await storage.getUserCards(userId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  app.patch("/api/cards/:cardId", isAuthenticated, async (req, res) => {
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
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:notificationId/read", isAuthenticated, async (req, res) => {
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

  app.patch("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:notificationId", isAuthenticated, async (req, res) => {
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
  app.get("/api/mobile-money-accounts", isAuthenticated, async (req, res) => {
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
  app.post("/api/instant-transfer", isAuthenticated, async (req, res) => {
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
  app.get("/api/contacts/frequent", isAuthenticated, async (req, res) => {
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
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Admin routes (protected)
  app.get("/api/admin/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/admin/kyc/pending", isAuthenticated, async (req, res) => {
    try {
      const pendingKYC = await storage.getPendingKYCDocuments();
      res.json(pendingKYC);
    } catch (error) {
      console.error("Error fetching pending KYC:", error);
      res.status(500).json({ message: "Failed to fetch pending KYC documents" });
    }
  });

  app.put("/api/admin/kyc/:documentId", isAuthenticated, async (req, res) => {
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

  app.put("/api/admin/users/:userId/suspend", isAuthenticated, async (req, res) => {
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

  app.get("/api/admin/export/:type", isAuthenticated, async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}