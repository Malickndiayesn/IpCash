import {
  users,
  accounts,
  transactions,
  cards,
  mobileMoneyAccounts,
  contacts,
  registeredOperators,
  instantTransfers,
  kycDocuments,
  type User,
  type UpsertUser,
  type Account,
  type InsertAccount,
  type Transaction,
  type InsertTransaction,
  type Card,
  type InsertCard,
  type MobileMoneyAccount,
  type InsertMobileMoneyAccount,
  type Contact,
  type InsertContact,
  type RegisteredOperator,
  type InsertRegisteredOperator,
  type InstantTransfer,
  type InsertInstantTransfer,
  type KycDocument,
  type InsertKycDocument,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Account operations
  getUserAccount(userId: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountBalance(accountId: string, newBalance: string): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  updateTransactionStatus(id: string, status: string): Promise<void>;
  
  // Card operations
  getUserCards(userId: string): Promise<Card[]>;
  createCard(card: InsertCard): Promise<Card>;
  updateCardSettings(cardId: string, settings: Partial<Card>): Promise<void>;
  
  // Mobile Money operations
  getUserMobileMoneyAccounts(userId: string): Promise<MobileMoneyAccount[]>;
  createMobileMoneyAccount(account: InsertMobileMoneyAccount): Promise<MobileMoneyAccount>;
  
  // Contact operations
  getUserContacts(userId: string): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  getFrequentContacts(userId: string): Promise<Contact[]>;
  
  // Registered Operator operations
  getRegisteredOperators(): Promise<RegisteredOperator[]>;
  getRegisteredOperator(id: string): Promise<RegisteredOperator | undefined>;
  
  // Instant Transfer operations
  createInstantTransfer(data: InsertInstantTransfer): Promise<InstantTransfer>;
  updateInstantTransferStatus(id: string, status: string): Promise<void>;
  getUserInstantTransfers(userId: string, limit?: number): Promise<InstantTransfer[]>;
  
  // KYC operations
  getKycDocuments(userId: string): Promise<KycDocument[]>;
  createKycDocument(document: InsertKycDocument): Promise<KycDocument>;
  updateKycDocumentStatus(documentId: string, status: string, rejectionReason?: string): Promise<KycDocument>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Account operations
  async getUserAccount(userId: string): Promise<Account | undefined> {
    const [account] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)));
    return account;
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const accountNumber = `IPCASH${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const [newAccount] = await db
      .insert(accounts)
      .values({ ...account, accountNumber })
      .returning();
    return newAccount;
  }

  async updateAccountBalance(accountId: string, newBalance: string): Promise<void> {
    await db
      .update(accounts)
      .set({ balance: newBalance })
      .where(eq(accounts.id, accountId));
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const reference = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const [newTransaction] = await db
      .insert(transactions)
      .values({ ...transaction, reference })
      .returning();
   
    // Update transaction status to completed for demo purposes
    await this.updateTransactionStatus(newTransaction.id, 'completed');
    
    return { ...newTransaction, status: 'completed' };
  }

  async getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(or(eq(transactions.fromUserId, userId), eq(transactions.toUserId, userId)))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }

  async updateTransactionStatus(id: string, status: string): Promise<void> {
    await db
      .update(transactions)
      .set({ status, updatedAt: new Date() })
      .where(eq(transactions.id, id));
  }

  // Card operations
  async getUserCards(userId: string): Promise<Card[]> {
    return await db
      .select()
      .from(cards)
      .where(and(eq(cards.userId, userId), eq(cards.isActive, true)));
  }

  async createCard(card: InsertCard): Promise<Card> {
    const cardNumber = `****-****-****-${Math.floor(1000 + Math.random() * 9000)}`;
    const [newCard] = await db
      .insert(cards)
      .values({ ...card, cardNumber })
      .returning();
    return newCard;
  }

  async updateCardSettings(cardId: string, settings: Partial<Card>): Promise<void> {
    await db
      .update(cards)
      .set(settings)
      .where(eq(cards.id, cardId));
  }

  // Mobile Money operations
  async getUserMobileMoneyAccounts(userId: string): Promise<MobileMoneyAccount[]> {
    return await db
      .select()
      .from(mobileMoneyAccounts)
      .where(and(eq(mobileMoneyAccounts.userId, userId), eq(mobileMoneyAccounts.isActive, true)));
  }

  async createMobileMoneyAccount(account: InsertMobileMoneyAccount): Promise<MobileMoneyAccount> {
    const [newAccount] = await db
      .insert(mobileMoneyAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  // Contact operations
  async getUserContacts(userId: string): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(eq(contacts.userId, userId));
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async getFrequentContacts(userId: string): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.userId, userId), eq(contacts.isFrequent, true)))
      .limit(10);
  }

  // Registered Operators operations
  async getRegisteredOperators(): Promise<RegisteredOperator[]> {
    const operators = await db.select().from(registeredOperators).where(eq(registeredOperators.isActive, true));
    
    // If no operators in DB, return default ones
    if (operators.length === 0) {
      return [
        {
          id: "ipcash-wallet",
          name: "IPCASH Wallet",
          code: "IPCASH",
          type: "wallet",
          apiEndpoint: null,
          isActive: true,
          transferFee: "0.5",
          maxTransferAmount: "1000000.00",
          minTransferAmount: "100.00",
          processingTime: "instant",
          supportedCurrencies: ["FCFA", "USD", "EUR"],
          createdAt: new Date()
        },
        {
          id: "orange-money",
          name: "Orange Money",
          code: "OM",
          type: "mobile_money",
          apiEndpoint: "https://api.orange.sn/money",
          isActive: true,
          transferFee: "1.0",
          maxTransferAmount: "500000.00",
          minTransferAmount: "100.00",
          processingTime: "instant",
          supportedCurrencies: ["FCFA"],
          createdAt: new Date()
        },
        {
          id: "wave-senegal",
          name: "Wave",
          code: "WAVE",
          type: "mobile_money",
          apiEndpoint: "https://api.wave.com/v1",
          isActive: true,
          transferFee: "0.0",
          maxTransferAmount: "1000000.00",
          minTransferAmount: "50.00",
          processingTime: "instant",
          supportedCurrencies: ["FCFA"],
          createdAt: new Date()
        }
      ];
    }
    
    return operators;
  }

  async getRegisteredOperator(id: string): Promise<RegisteredOperator | undefined> {
    const operators = await this.getRegisteredOperators();
    return operators.find(op => op.id === id);
  }

  // Instant Transfer operations
  async createInstantTransfer(data: InsertInstantTransfer): Promise<InstantTransfer> {
    const [instantTransfer] = await db
      .insert(instantTransfers)
      .values(data)
      .returning();
    return instantTransfer;
  }

  async updateInstantTransferStatus(id: string, status: string): Promise<void> {
    await db
      .update(instantTransfers)
      .set({ 
        status, 
        processedAt: status === "completed" ? new Date() : null 
      })
      .where(eq(instantTransfers.id, id));
  }

  async getUserInstantTransfers(userId: string, limit: number = 50): Promise<InstantTransfer[]> {
    return await db
      .select()
      .from(instantTransfers)
      .where(eq(instantTransfers.userId, userId))
      .orderBy(desc(instantTransfers.createdAt))
      .limit(limit);
  }

  // KYC operations
  async getKycDocuments(userId: string): Promise<KycDocument[]> {
    return await db.select().from(kycDocuments).where(eq(kycDocuments.userId, userId));
  }

  async createKycDocument(document: InsertKycDocument): Promise<KycDocument> {
    const [kycDocument] = await db.insert(kycDocuments).values(document).returning();
    return kycDocument;
  }

  async updateKycDocumentStatus(documentId: string, status: string, rejectionReason?: string): Promise<KycDocument> {
    const [kycDocument] = await db
      .update(kycDocuments)
      .set({ 
        status, 
        rejectionReason,
        verifiedAt: status === 'approved' ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(kycDocuments.id, documentId))
      .returning();
    return kycDocument;
  }

  // Helper method to get mobile money accounts (alias for getUserMobileMoneyAccounts)
  async getMobileMoneyAccounts(userId: string): Promise<MobileMoneyAccount[]> {
    return this.getUserMobileMoneyAccounts(userId);
  }
}

export const storage = new DatabaseStorage();
