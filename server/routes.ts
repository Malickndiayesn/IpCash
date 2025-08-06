import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService } from "./objectStorage";

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

  // Dashboard route
  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const account = await storage.getUserAccount(userId);
      res.json({ account });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // KYC routes
  app.get("/api/kyc-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const kycDocuments = await storage.getKycDocuments(userId);
      
      // Calculate completion percentage
      const totalRequired = 3; // CNI/Passport, Selfie, Proof of address
      const completed = kycDocuments.filter(doc => doc.status === 'approved').length;
      const completionPercentage = Math.round((completed / totalRequired) * 100);
      
      res.json({
        status: completed === totalRequired ? 'approved' : 
                kycDocuments.some(doc => doc.status === 'pending') ? 'pending' : 'none',
        completionPercentage,
        documents: kycDocuments
      });
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      res.status(500).json({ message: "Failed to fetch KYC status" });
    }
  });

  app.post("/api/kyc-documents/upload", isAuthenticated, async (req: any, res) => {
    try {
      const documentType = req.query.type;
      if (!documentType) {
        return res.status(400).json({ error: "Document type is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getKycDocumentUploadURL(documentType);
      
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.post("/api/kyc-documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { documentType, documentUrl, documentNumber, expiryDate, firstName, lastName, dateOfBirth, placeOfBirth } = req.body;

      const kycDocument = await storage.createKycDocument({
        userId,
        documentType,
        documentUrl,
        documentNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        extractedData: {
          firstName,
          lastName,
          dateOfBirth,
          placeOfBirth
        }
      });

      res.json(kycDocument);
    } catch (error) {
      console.error("Error creating KYC document:", error);
      res.status(500).json({ error: "Failed to create KYC document" });
    }
  });

  // Registered operators
  app.get("/api/registered-operators", async (req, res) => {
    try {
      const operators = await storage.getRegisteredOperators();
      res.json(operators);
    } catch (error) {
      console.error("Error fetching operators:", error);
      res.status(500).json({ message: "Failed to fetch operators" });
    }
  });

  // Instant transfers
  app.post("/api/instant-transfers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transferData = req.body;
      
      const transfer = await storage.createInstantTransfer({
        ...transferData,
        userId,
        status: "pending"
      });

      res.json(transfer);
    } catch (error) {
      console.error("Error creating instant transfer:", error);
      res.status(500).json({ message: "Failed to create transfer" });
    }
  });

  // Transactions
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Mobile money accounts
  app.get("/api/mobile-money-accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accounts = await storage.getMobileMoneyAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching mobile money accounts:", error);
      res.status(500).json({ message: "Failed to fetch mobile money accounts" });
    }
  });

  // Frequent contacts
  app.get("/api/contacts/frequent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getFrequentContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching frequent contacts:", error);
      res.status(500).json({ message: "Failed to fetch frequent contacts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}