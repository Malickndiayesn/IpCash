import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  accountNumber: varchar("account_number").unique().notNull(),
  accountType: varchar("account_type").notNull().default("current"),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00"),
  currency: varchar("currency").default("FCFA"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").references(() => users.id),
  toUserId: varchar("to_user_id").references(() => users.id),
  fromAccountId: varchar("from_account_id").references(() => accounts.id),
  toAccountId: varchar("to_account_id").references(() => accounts.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency").default("FCFA"),
  type: varchar("type").notNull(), // 'transfer', 'deposit', 'withdrawal', 'payment'
  status: varchar("status").default("pending"), // 'pending', 'completed', 'failed', 'cancelled'
  description: text("description"),
  reference: varchar("reference").unique(),
  fees: decimal("fees", { precision: 15, scale: 2 }).default("0.00"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).default("1.000000"),
  metadata: jsonb("metadata"), // Additional transaction data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cards = pgTable("cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  accountId: varchar("account_id").references(() => accounts.id).notNull(),
  cardNumber: varchar("card_number").unique().notNull(), // Encrypted/masked
  cardType: varchar("card_type").default("virtual"), // 'virtual', 'physical'
  cardBrand: varchar("card_brand").default("visa"), // 'visa', 'mastercard'
  expiryMonth: integer("expiry_month").notNull(),
  expiryYear: integer("expiry_year").notNull(),
  isActive: boolean("is_active").default(true),
  dailyLimit: decimal("daily_limit", { precision: 15, scale: 2 }).default("100000.00"),
  monthlyLimit: decimal("monthly_limit", { precision: 15, scale: 2 }).default("500000.00"),
  onlinePayments: boolean("online_payments").default(true),
  contactlessPayments: boolean("contactless_payments").default(true),
  atmWithdrawals: boolean("atm_withdrawals").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mobileMoneyAccounts = pgTable("mobile_money_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  provider: varchar("provider").notNull(), // 'orange_money', 'wave', 'free_money'
  phoneNumber: varchar("phone_number").notNull(),
  accountName: varchar("account_name"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  contactUserId: varchar("contact_user_id").references(() => users.id),
  name: varchar("name").notNull(),
  phoneNumber: varchar("phone_number"),
  email: varchar("email"),
  isFrequent: boolean("is_frequent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// KYC and verification
export const kycDocuments = pgTable("kyc_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  documentType: varchar("document_type").notNull(), // 'id_card', 'passport', 'driver_license'
  documentNumber: varchar("document_number").notNull(),
  frontImageUrl: varchar("front_image_url"),
  backImageUrl: varchar("back_image_url"),
  verificationStatus: varchar("verification_status").default("pending"), // 'pending', 'approved', 'rejected'
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Savings goals and automatic savings
export const savingsGoals = pgTable("savings_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 15, scale: 2 }).default("0.00"),
  targetDate: timestamp("target_date"),
  autoSaveAmount: decimal("auto_save_amount", { precision: 15, scale: 2 }),
  autoSaveFrequency: varchar("auto_save_frequency"), // 'daily', 'weekly', 'monthly'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Credit scoring and loan requests
export const creditScore = pgTable("credit_score", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  score: integer("score").notNull(), // 300-850 range
  factors: jsonb("factors"), // AI analysis factors
  lastCalculated: timestamp("last_calculated").defaultNow(),
  transactionHistory: decimal("transaction_history", { precision: 5, scale: 2 }),
  savingsBehavior: decimal("savings_behavior", { precision: 5, scale: 2 }),
  paymentReliability: decimal("payment_reliability", { precision: 5, scale: 2 }),
});

export const loanRequests = pgTable("loan_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  purpose: varchar("purpose").notNull(),
  duration: integer("duration").notNull(), // in months
  interestRate: decimal("interest_rate", { precision: 5, scale: 4 }),
  status: varchar("status").default("pending"), // 'pending', 'approved', 'rejected', 'disbursed', 'repaid'
  aiDecision: jsonb("ai_decision"), // AI analysis and recommendation
  approvedAmount: decimal("approved_amount", { precision: 15, scale: 2 }),
  monthlyPayment: decimal("monthly_payment", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  decidedAt: timestamp("decided_at"),
});

// Financial analytics and insights
export const financialInsights = pgTable("financial_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  month: varchar("month").notNull(), // 'YYYY-MM'
  totalIncome: decimal("total_income", { precision: 15, scale: 2 }).default("0.00"),
  totalExpenses: decimal("total_expenses", { precision: 15, scale: 2 }).default("0.00"),
  savingsRate: decimal("savings_rate", { precision: 5, scale: 2 }),
  categoryBreakdown: jsonb("category_breakdown"), // expenses by category
  recommendations: jsonb("recommendations"), // AI-generated recommendations
  budgetAlerts: jsonb("budget_alerts"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Support tickets
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // 'technical', 'billing', 'general'
  priority: varchar("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: varchar("status").default("open"), // 'open', 'in_progress', 'resolved', 'closed'
  assignedTo: varchar("assigned_to"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportMessages = pgTable("support_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").references(() => supportTickets.id).notNull(),
  senderId: varchar("sender_id").notNull(),
  senderType: varchar("sender_type").notNull(), // 'user', 'agent'
  message: text("message").notNull(),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  reference: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCardSchema = createInsertSchema(cards).omit({
  id: true,
  createdAt: true,
});

export const insertMobileMoneyAccountSchema = createInsertSchema(mobileMoneyAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({
  id: true,
  createdAt: true,
  verifiedAt: true,
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).omit({
  id: true,
  createdAt: true,
});

export const insertLoanRequestSchema = createInsertSchema(loanRequests).omit({
  id: true,
  createdAt: true,
  decidedAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportMessageSchema = createInsertSchema(supportMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type MobileMoneyAccount = typeof mobileMoneyAccounts.$inferSelect;
export type InsertMobileMoneyAccount = z.infer<typeof insertMobileMoneyAccountSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;
export type CreditScore = typeof creditScore.$inferSelect;
export type LoanRequest = typeof loanRequests.$inferSelect;
export type InsertLoanRequest = z.infer<typeof insertLoanRequestSchema>;
export type FinancialInsight = typeof financialInsights.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
