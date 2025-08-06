import {
  users,
  userRoles,
  userRoleAssignments,
  transferFees,
  operationProfits,
  operationAnalytics,
  accounts,
  transactions,
  cards,
  mobileMoneyAccounts,
  contacts,
  registeredOperators,
  instantTransfers,
  kycDocuments,
  notifications,
  notificationPreferences,
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
  type UserRole,
  type InsertUserRole,
  type UserRoleAssignment,
  type InsertUserRoleAssignment,
  type TransferFee,
  type InsertTransferFee,
  type OperationProfit,
  type InsertOperationProfit,
  type OperationAnalytics,
  type InsertOperationAnalytics,
  type KycDocument,
  type InsertKycDocument,
  type Notification,
  type InsertNotification,
  type NotificationPreferences,
  type InsertNotificationPreferences,
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
  updateCardSettings(cardId: string, settings: Partial<Card>): Promise<Card>;
  
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
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: string, userId?: string): Promise<void>;
  markNotificationAsDelivered(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUndeliveredNotifications(userId: string): Promise<Notification[]>;
  deleteNotification(notificationId: string, userId: string): Promise<void>;
  
  // Notification preferences
  getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined>;
  updateNotificationPreferences(userId: string, preferences: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences>;
  
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

  async updateCardSettings(cardId: string, settings: Partial<Card>): Promise<Card> {
    await db
      .update(cards)
      .set(settings)
      .where(eq(cards.id, cardId));
    
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



  // Helper method to get mobile money accounts (alias for getUserMobileMoneyAccounts)
  async getMobileMoneyAccounts(userId: string): Promise<MobileMoneyAccount[]> {
    return this.getUserMobileMoneyAccounts(userId);
  }

  // Admin operations
  async getAdminStats(): Promise<any> {
    try {
      const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
      const totalTransactions = await db.select({ count: sql<number>`count(*)` }).from(transactions);
      const pendingKYC = await db.select({ count: sql<number>`count(*)` }).from(kycDocuments).where(eq(kycDocuments.verificationStatus, 'pending'));
      const activeCards = await db.select({ count: sql<number>`count(*)` }).from(cards).where(eq(cards.isActive, true));
      
      return {
        totalUsers: Number(totalUsers[0]?.count || 0),
        activeUsers: Number(totalUsers[0]?.count || 0), 
        totalTransactions: Number(totalTransactions[0]?.count || 0),
        totalAmount: "0.00",
        pendingKYC: Number(pendingKYC[0]?.count || 0),
        activeCards: Number(activeCards[0]?.count || 0)
      };
    } catch (error) {
      console.error('Error in getAdminStats:', error);
      // Return default stats if query fails
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalTransactions: 0,
        totalAmount: "0.00", 
        pendingKYC: 0,
        activeCards: 0
      };
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).limit(100);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(100);
  }

  async getPendingKYCDocuments(): Promise<any[]> {
    try {
      return await db
        .select({
          id: kycDocuments.id,
          userId: kycDocuments.userId,
          documentType: kycDocuments.documentType,
          documentUrl: kycDocuments.documentUrl,
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
    } catch (error) {
      console.error('Error fetching pending KYC documents:', error);
      return [];
    }
  }

  async suspendUser(userId: string, suspend: boolean): Promise<void> {
    // For now, we'll just log this - in a real app you'd update user status
    console.log(`${suspend ? 'Suspending' : 'Reactivating'} user ${userId}`);
  }

  async updateKycDocumentStatus(documentId: string, status: string, rejectionReason?: string): Promise<KycDocument> {
    const updateData: any = { 
      verificationStatus: status, 
      updatedAt: new Date(),
      ...(rejectionReason && { rejectionReason })
    };
    
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
          `${tx.id},${tx.userId},${tx.recipientId || ''},${tx.amount},${tx.currency},${tx.status},${tx.type},${tx.createdAt}`
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

  // Notification Operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async markNotificationAsRead(notificationId: string, userId?: string): Promise<void> {
    let query = db
      .update(notifications)
      .set({ isRead: true, readAt: new Date(), updatedAt: new Date() })
      .where(eq(notifications.id, notificationId));

    if (userId) {
      query = query.where(eq(notifications.userId, userId));
    }

    await query;
  }

  async markNotificationAsDelivered(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ 
        isDelivered: true, 
        deliveredAt: new Date(), 
        updatedAt: new Date() 
      })
      .where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date(), updatedAt: new Date() })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
  }

  async getUndeliveredNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isDelivered, false)
      ))
      .orderBy(desc(notifications.createdAt));
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await db
      .delete(notifications)
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));
  }

  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return preferences;
  }

  async updateNotificationPreferences(userId: string, preferencesData: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences> {
    const [preferences] = await db
      .insert(notificationPreferences)
      .values({ ...preferencesData, userId })
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: { ...preferencesData, updatedAt: new Date() }
      })
      .returning();
    return preferences;
  }

  // New Admin Operations
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getUserRoles(): Promise<UserRole[]> {
    return await db.select().from(userRoles).where(eq(userRoles.isActive, true));
  }

  async createUserRole(roleData: InsertUserRole): Promise<UserRole> {
    const [role] = await db.insert(userRoles).values(roleData).returning();
    return role;
  }

  async assignUserRole(assignment: InsertUserRoleAssignment): Promise<UserRoleAssignment> {
    const [roleAssignment] = await db.insert(userRoleAssignments).values(assignment).returning();
    return roleAssignment;
  }

  async getUserRoleAssignments(userId: string): Promise<UserRoleAssignment[]> {
    return await db.select()
      .from(userRoleAssignments)
      .where(eq(userRoleAssignments.userId, userId));
  }

  async getTransferFees(): Promise<TransferFee[]> {
    return await db.select().from(transferFees).where(eq(transferFees.isActive, true));
  }

  async createTransferFee(feeData: InsertTransferFee): Promise<TransferFee> {
    const [fee] = await db.insert(transferFees).values(feeData).returning();
    return fee;
  }

  async updateTransferFee(feeId: string, updates: Partial<TransferFee>): Promise<TransferFee> {
    const [updatedFee] = await db
      .update(transferFees)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(transferFees.id, feeId))
      .returning();
    return updatedFee;
  }

  async getOperationProfits(limit: number = 50): Promise<OperationProfit[]> {
    return await db.select()
      .from(operationProfits)
      .orderBy(desc(operationProfits.date))
      .limit(limit);
  }

  async createOperationProfit(profitData: InsertOperationProfit): Promise<OperationProfit> {
    const [profit] = await db.insert(operationProfits).values(profitData).returning();
    return profit;
  }

  async getOperationAnalytics(operationType?: string, limit: number = 30): Promise<OperationAnalytics[]> {
    let query = db.select().from(operationAnalytics);
    
    if (operationType) {
      query = query.where(eq(operationAnalytics.operationType, operationType));
    }
    
    return await query
      .orderBy(desc(operationAnalytics.date))
      .limit(limit);
  }

  async getProfitsByOperationType(): Promise<any[]> {
    return await db
      .select({
        operationType: operationProfits.operationType,
        totalProfit: sql`sum(${operationProfits.netProfit})`,
        transactionCount: sql`count(*)`,
        avgProfitMargin: sql`avg(${operationProfits.profitMargin})`
      })
      .from(operationProfits)
      .groupBy(operationProfits.operationType);
  }

  async getMonthlyProfitTrends(): Promise<any[]> {
    return await db
      .select({
        month: sql`date_trunc('month', ${operationProfits.date})`,
        totalProfit: sql`sum(${operationProfits.netProfit})`,
        totalFees: sql`sum(${operationProfits.feeAmount})`,
        transactionCount: sql`count(*)`
      })
      .from(operationProfits)
      .groupBy(sql`date_trunc('month', ${operationProfits.date})`)
      .orderBy(sql`date_trunc('month', ${operationProfits.date}) DESC`)
      .limit(12);
  }
}

export const storage = new DatabaseStorage();
