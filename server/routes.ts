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

      const currentBalance = parseFloat(fromAccount.balance || '0');
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

  // Currency and international transfer routes
  app.get('/api/currencies', async (req, res) => {
    try {
      // Mock currency data for now
      const currencies = [
        { id: 'fcfa-id', code: 'FCFA', name: 'Franc CFA', symbol: 'F', exchangeRate: 1, isActive: true },
        { id: 'usd-id', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 655.957, isActive: true },
        { id: 'eur-id', code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 655.957, isActive: true },
        { id: 'gbp-id', code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 780.123, isActive: true },
        { id: 'cad-id', code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: 485.67, isActive: true },
        { id: 'cny-id', code: 'CNY', name: 'Chinese Yuan', symbol: '¥', exchangeRate: 91.23, isActive: true }
      ];
      res.json(currencies);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      res.status(500).json({ message: "Failed to fetch currencies" });
    }
  });

  app.get('/api/exchange-rate/:from/:to', async (req, res) => {
    try {
      const { from, to } = req.params;
      
      // Define all exchange rates explicitly
      const exchangeRates: Record<string, number> = {
        // USD conversions
        'usd-id-fcfa-id': 655.957,    // 1 USD = 655.957 FCFA
        'fcfa-id-usd-id': 0.001525,   // 1 FCFA = 0.001525 USD
        
        // EUR conversions  
        'eur-id-fcfa-id': 655.957,    // 1 EUR = 655.957 FCFA
        'fcfa-id-eur-id': 0.001525,   // 1 FCFA = 0.001525 EUR
        
        // GBP conversions
        'gbp-id-fcfa-id': 780.123,    // 1 GBP = 780.123 FCFA
        'fcfa-id-gbp-id': 0.001282,   // 1 FCFA = 0.001282 GBP
        
        // CAD conversions
        'cad-id-fcfa-id': 485.67,     // 1 CAD = 485.67 FCFA
        'fcfa-id-cad-id': 0.002059,   // 1 FCFA = 0.002059 CAD
        
        // CNY conversions
        'cny-id-fcfa-id': 91.23,      // 1 CNY = 91.23 FCFA
        'fcfa-id-cny-id': 0.010962,   // 1 FCFA = 0.010962 CNY
        
        // Cross currency rates
        'usd-id-eur-id': 1.0,         // 1 USD = 1.0 EUR (same rate in this example)
        'eur-id-usd-id': 1.0,         // 1 EUR = 1.0 USD
        'usd-id-gbp-id': 0.841,       // 1 USD = 0.841 GBP
        'gbp-id-usd-id': 1.189,       // 1 GBP = 1.189 USD
        'usd-id-cad-id': 1.35,        // 1 USD = 1.35 CAD
        'cad-id-usd-id': 0.741,       // 1 CAD = 0.741 USD
        'usd-id-cny-id': 7.19,        // 1 USD = 7.19 CNY
        'cny-id-usd-id': 0.139,       // 1 CNY = 0.139 USD
      };
      
      let rate = 1;
      
      if (from === to) {
        rate = 1;
      } else {
        const rateKey = `${from}-${to}`;
        rate = exchangeRates[rateKey];
        if (!rate) {
          rate = 1; // fallback if rate not found
        }
      }
      
      res.json({ rate: parseFloat(rate.toFixed(6)), from, to });
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      res.status(500).json({ message: "Failed to fetch exchange rate" });
    }
  });

  app.get('/api/exchange-rates/all', async (req, res) => {
    try {
      // All exchange rates against FCFA (1 unit = X FCFA)
      const rates = {
        'usd-id': 655.957,    // 1 USD = 655.957 FCFA
        'eur-id': 655.957,    // 1 EUR = 655.957 FCFA
        'gbp-id': 780.123,    // 1 GBP = 780.123 FCFA
        'cad-id': 485.67,     // 1 CAD = 485.67 FCFA 
        'cny-id': 91.23,      // 1 CNY = 91.23 FCFA
        'fcfa-id': 1          // 1 FCFA = 1 FCFA
      };
      res.json(rates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      res.status(500).json({ message: "Failed to fetch exchange rates" });
    }
  });

  app.get('/api/multi-currency-accounts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      // Mock multi-currency accounts
      const accounts = [
        {
          id: 'account-1',
          userId,
          currencyId: 'usd-id',
          balance: '1250.75',
          accountNumber: '1234567890123456',
          isDefault: true,
          status: 'active'
        },
        {
          id: 'account-2', 
          userId,
          currencyId: 'eur-id',
          balance: '850.50',
          accountNumber: '2345678901234567',
          isDefault: false,
          status: 'active'
        }
      ];
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching multi-currency accounts:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post('/api/multi-currency-accounts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { currencyId, isDefault } = req.body;
      
      const newAccount = {
        id: `account-${Date.now()}`,
        userId,
        currencyId,
        balance: '0.00',
        accountNumber: `${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        isDefault: isDefault || false,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      res.json(newAccount);
    } catch (error) {
      console.error("Error creating multi-currency account:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post('/api/international-transfers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const transferData = req.body;
      
      const newTransfer = {
        id: `transfer-${Date.now()}`,
        userId,
        ...transferData,
        reference: `INT${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      res.json(newTransfer);
    } catch (error) {
      console.error("Error creating international transfer:", error);
      res.status(500).json({ message: "Failed to create transfer" });
    }
  });

  app.post('/api/currency-exchanges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const exchangeData = req.body;
      
      const newExchange = {
        id: `exchange-${Date.now()}`,
        userId,
        ...exchangeData,
        status: 'completed',
        executedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      res.json(newExchange);
    } catch (error) {
      console.error("Error creating currency exchange:", error);
      res.status(500).json({ message: "Failed to create exchange" });
    }
  });

  app.get('/api/banking-partners', async (req, res) => {
    try {
      // Mock banking partners
      const partners = [
        {
          id: 'partner-1',
          name: 'Wells Fargo',
          country: 'United States',
          countryCode: 'US',
          swiftCode: 'WFBIUS6S',
          isActive: true
        },
        {
          id: 'partner-2',
          name: 'HSBC',
          country: 'United Kingdom', 
          countryCode: 'GB',
          swiftCode: 'HBUKGB4B',
          isActive: true
        },
        {
          id: 'partner-3',
          name: 'BNP Paribas',
          country: 'France',
          countryCode: 'FR', 
          swiftCode: 'BNPAFRPP',
          isActive: true
        },
        {
          id: 'partner-4',
          name: 'Deutsche Bank',
          country: 'Germany',
          countryCode: 'DE',
          swiftCode: 'DEUTDEFF',
          isActive: true
        }
      ];
      res.json(partners);
    } catch (error) {
      console.error("Error fetching banking partners:", error);
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  // Recharge/deposit endpoint
  app.post('/api/recharge', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { amount, method, description, paymentGateway } = req.body;
      
      if (!amount || !method) {
        return res.status(400).json({ message: "Amount and method are required" });
      }

      const numericAmount = parseFloat(amount);
      if (numericAmount <= 0 || numericAmount > 1000000) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Get user's account
      const userAccount = await storage.getUserAccount(userId);
      if (!userAccount) {
        return res.status(404).json({ message: "User account not found" });
      }

      // For payment gateway integration, we'll set status to pending initially
      const status = paymentGateway ? "pending" : "completed";

      // Create deposit transaction
      const transactionData = {
        toAccountId: userAccount.id,
        type: "deposit" as const,
        amount: amount.toString(),
        description: description || "Recharge de compte",
        recipientType: "internal" as const,
        status: status as const,
        metadata: { 
          rechargeMethod: method,
          paymentGateway: paymentGateway || null,
          processingFee: calculateProcessingFee(method, numericAmount)
        }
      };

      const transaction = await storage.createTransaction(transactionData);

      // Only update balance immediately for non-gateway methods (mobile money, etc.)
      if (!paymentGateway) {
        const currentBalance = parseFloat(userAccount.balance || "0");
        const newBalance = (currentBalance + numericAmount).toString();
        await storage.updateAccountBalance(userAccount.id, newBalance);
      }

      res.json({ 
        transaction,
        message: paymentGateway ? "Payment initiated" : "Recharge successful",
        newBalance: !paymentGateway ? (parseFloat(userAccount.balance || "0") + numericAmount).toString() : userAccount.balance,
        requiresPayment: !!paymentGateway
      });
    } catch (error) {
      console.error("Error processing recharge:", error);
      res.status(500).json({ message: "Failed to process recharge" });
    }
  });

  // Helper function to calculate processing fees
  function calculateProcessingFee(method: string, amount: number): string {
    switch (method) {
      case 'visa_card':
      case 'stripe_card':
        return (amount * 0.029 + 0.30).toFixed(2); // 2.9% + 30¢
      case 'paypal':
        return (amount * 0.034 + 0.35).toFixed(2); // 3.4% + 35¢
      case 'bank_transfer':
        return "500"; // Fixed fee
      default:
        return "0"; // Free for mobile money
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
