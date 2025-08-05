import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTransactionSchema, insertContactSchema, insertMobileMoneyAccountSchema } from "@shared/schema";
import { z } from "zod";

const transferSchema = z.object({
  recipientPhone: z.string().min(8),
  amount: z.string().refine((val) => parseFloat(val) > 0, {
    message: "Amount must be greater than 0"
  }),
  description: z.string().optional(),
  type: z.enum(['p2p', 'mobile_money']),
  provider: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Ensure user has an account
      let account = await storage.getUserAccount(userId);
      if (!account) {
        account = await storage.createAccount({
          userId,
          accountNumber: `IPCASH${Date.now()}`,
          balance: "125430.00", // Initial balance for new users
        });
      }

      // Get user's cards
      let cards = await storage.getUserCards(userId);
      if (cards.length === 0) {
        // Create a default virtual card
        const newCard = await storage.createCard({
          userId,
          accountId: account.id,
          cardNumber: `****-****-****-${Math.floor(1000 + Math.random() * 9000)}`,
          expiryMonth: 12,
          expiryYear: 2027,
          cardType: 'virtual',
          cardBrand: 'visa',
        });
        cards = [newCard];
      }

      const userWithAccount = {
        ...user,
        account,
        cards: cards[0], // Return primary card
      };

      res.json(userWithAccount);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const account = await storage.getUserAccount(userId);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      const recentTransactions = await storage.getUserTransactions(userId, 5);
      const cards = await storage.getUserCards(userId);
      const mobileMoneyAccounts = await storage.getUserMobileMoneyAccounts(userId);

      res.json({
        account,
        recentTransactions,
        cards,
        mobileMoneyAccounts,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Get transactions
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Create transfer
  app.post("/api/transfer", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transferData = transferSchema.parse(req.body);

      const fromAccount = await storage.getUserAccount(userId);
      if (!fromAccount) {
        return res.status(404).json({ message: "Account not found" });
      }

      const currentBalance = parseFloat(fromAccount.balance);
      const transferAmount = parseFloat(transferData.amount);
      const fees = transferData.type === 'mobile_money' ? 150 : 0;
      const totalAmount = transferAmount + fees;

      if (currentBalance < totalAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        fromUserId: userId,
        fromAccountId: fromAccount.id,
        amount: transferData.amount,
        fees: fees.toString(),
        type: 'transfer',
        description: transferData.description || `Transfer to ${transferData.recipientPhone}`,
        metadata: {
          recipientPhone: transferData.recipientPhone,
          transferType: transferData.type,
          provider: transferData.provider,
        },
      });

      // Update account balance
      const newBalance = (currentBalance - totalAmount).toFixed(2);
      await storage.updateAccountBalance(fromAccount.id, newBalance);

      res.json({
        transaction,
        newBalance,
        message: "Transfer completed successfully",
      });
    } catch (error) {
      console.error("Error processing transfer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid transfer data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to process transfer" });
    }
  });

  // Get user cards
  app.get("/api/cards", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cards = await storage.getUserCards(userId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  // Update card settings
  app.patch("/api/cards/:cardId", isAuthenticated, async (req: any, res) => {
    try {
      const { cardId } = req.params;
      const updates = req.body;
      
      await storage.updateCardSettings(cardId, updates);
      res.json({ message: "Card settings updated successfully" });
    } catch (error) {
      console.error("Error updating card settings:", error);
      res.status(500).json({ message: "Failed to update card settings" });
    }
  });

  // Get contacts
  app.get("/api/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getUserContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Get frequent contacts
  app.get("/api/contacts/frequent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const frequentContacts = await storage.getFrequentContacts(userId);
      res.json(frequentContacts);
    } catch (error) {
      console.error("Error fetching frequent contacts:", error);
      res.status(500).json({ message: "Failed to fetch frequent contacts" });
    }
  });

  // Create contact
  app.post("/api/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contactData = insertContactSchema.parse({ ...req.body, userId });
      
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid contact data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  // Get mobile money accounts
  app.get("/api/mobile-money", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accounts = await storage.getUserMobileMoneyAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching mobile money accounts:", error);
      res.status(500).json({ message: "Failed to fetch mobile money accounts" });
    }
  });

  // Create mobile money account
  app.post("/api/mobile-money", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accountData = insertMobileMoneyAccountSchema.parse({ ...req.body, userId });
      
      const account = await storage.createMobileMoneyAccount(accountData);
      res.json(account);
    } catch (error) {
      console.error("Error creating mobile money account:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid account data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create mobile money account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
