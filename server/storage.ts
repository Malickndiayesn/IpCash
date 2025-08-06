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
  
  // Notification operations  
  getUserNotifications(userId: string): Promise<any[]>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(notificationId: string, userId: string): Promise<void>;
  
  // Enhanced Card operations
  updateCardSettings(cardId: string, userId: string, settings: any): Promise<Card>;
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

  async updateCardSettings(cardId: string, userId: string, settings: any): Promise<Card> {
    await db
      .update(cards)
      .set(settings)
      .where(and(eq(cards.id, cardId), eq(cards.userId, userId)));
    
    // Return updated card
    const [updatedCard] = await db
      .select()
      .from(cards)
      .where(eq(cards.id, cardId));
      
    return updatedCard;
  }

  // Notification operations
  async getUserNotifications(userId: string): Promise<any[]> {
    // Mock implementation - return sample notifications
    return [
      {
        id: "notif-1",
        userId,
        title: "Paiement reçu",
        message: "Vous avez reçu 25,000 FCFA de Jean Dupont",
        type: "payment",
        isRead: false,
        createdAt: new Date()
      },
      {
        id: "notif-2", 
        userId,
        title: "Carte bloquée",
        message: "Votre carte virtuelle a été temporairement bloquée",
        type: "security",
        isRead: true,
        createdAt: new Date()
      }
    ];
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    // Mock implementation
    console.log(`Marking notification ${notificationId} as read for user ${userId}`);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    // Mock implementation  
    console.log(`Marking all notifications as read for user ${userId}`);
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    // Mock implementation
    console.log(`Deleting notification ${notificationId} for user ${userId}`);
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
      .where(eq(instantTransfers.fromUserId, userId))
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

  // Admin operations
  async getAdminStats(): Promise<any> {
    const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
    const totalTransactions = await db.select({ count: sql`count(*)` }).from(transactions);
    const pendingKYC = await db.select({ count: sql`count(*)` }).from(kycDocuments).where(eq(kycDocuments.verificationStatus, 'pending'));
    const activeCards = await db.select({ count: sql`count(*)` }).from(cards).where(eq(cards.isActive, true));
    
    return {
      totalUsers: Number(totalUsers[0]?.count || 0),
      activeUsers: Number(totalUsers[0]?.count || 0), // Simplified - same as total for now
      totalTransactions: Number(totalTransactions[0]?.count || 0),
      totalAmount: "0.00", // Placeholder - could calculate sum
      pendingKYC: Number(pendingKYC[0]?.count || 0),
      activeCards: Number(activeCards[0]?.count || 0)
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).limit(100);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(100);
  }

  async getPendingKYCDocuments(): Promise<any[]> {
    return await db
      .select({
        id: kycDocuments.id,
        userId: kycDocuments.userId,
        documentType: kycDocuments.documentType,
        frontImageUrl: kycDocuments.frontImageUrl,
        status: kycDocuments.verificationStatus,
        createdAt: kycDocuments.createdAt,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email
      })
      .from(kycDocuments)
      .leftJoin(users, eq(kycDocuments.userId, users.id))
      .where(eq(kycDocuments.verificationStatus, 'pending'))
      .limit(50);
  }

  async suspendUser(userId: string, suspend: boolean): Promise<void> {
    // For now, we'll just log this - in a real app you'd update user status
    console.log(`${suspend ? 'Suspending' : 'Reactivating'} user ${userId}`);
  }

  async updateKycDocumentStatus(documentId: string, status: string, rejectionReason?: string): Promise<KycDocument> {
    const updateData: any = { verificationStatus: status, updatedAt: new Date() };
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    const [updated] = await db
      .update(kycDocuments)
      .set(updateData)
      .where(eq(kycDocuments.id, documentId))
      .returning();
    
    return updated;
  }

  async exportData(type: string): Promise<string> {
    let headers = '';
    let rows: string[] = [];
    
    switch (type) {
      case 'users':
        headers = 'ID,Email,First Name,Last Name,Created At\n';
        const users = await this.getAllUsers();
        rows = users.map(user => 
          `${user.id},${user.email},${user.firstName},${user.lastName},${user.createdAt}`
        );
        break;
        
      case 'transactions':
        headers = 'ID,From User,To User,Amount,Currency,Status,Type,Created At\n';
        const transactions = await this.getAllTransactions();
        rows = transactions.map(tx => 
          `${tx.id},${tx.fromUserId},${tx.toUserId},${tx.amount},${tx.currency},${tx.status},${tx.type},${tx.createdAt}`
        );
        break;
        
      case 'kyc':
        headers = 'ID,User ID,Document Type,Status,Created At\n';
        const kycDocs = await db.select().from(kycDocuments).limit(1000);
        rows = kycDocs.map(doc => 
          `${doc.id},${doc.userId},${doc.documentType},${doc.status},${doc.createdAt}`
        );
        break;
        
      default:
        headers = 'Type,Count\n';
        rows = ['Unknown export type,0'];
    }
    
    return headers + rows.join('\n');
  }
}

export const storage = new DatabaseStorage();
