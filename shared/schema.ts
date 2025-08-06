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
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Registered operators for instant transfers
export const registeredOperators = pgTable("registered_operators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // 'Orange Money', 'Wave', 'Free Money', 'IPCASH'
  code: varchar("code").notNull().unique(), // 'OM', 'WAVE', 'FREE', 'IPCASH'
  type: varchar("type").notNull(), // 'mobile_money', 'wallet', 'bank'
  apiEndpoint: varchar("api_endpoint"),
  isActive: boolean("is_active").default(true),
  transferFee: decimal("transfer_fee", { precision: 5, scale: 2 }).default("0.00"),
  maxTransferAmount: decimal("max_transfer_amount", { precision: 15, scale: 2 }).default("1000000.00"),
  minTransferAmount: decimal("min_transfer_amount", { precision: 15, scale: 2 }).default("100.00"),
  processingTime: varchar("processing_time").default("instant"), // 'instant', 'minutes', 'hours'
  supportedCurrencies: text("supported_currencies").array().default(["FCFA"]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Instant transfer records between operators
export const instantTransfers = pgTable("instant_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").references(() => transactions.id).notNull(),
  fromOperatorId: varchar("from_operator_id").references(() => registeredOperators.id).notNull(),
  toOperatorId: varchar("to_operator_id").references(() => registeredOperators.id).notNull(),
  fromAccount: varchar("from_account").notNull(), // Phone number or account ID
  toAccount: varchar("to_account").notNull(), // Phone number or account ID
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  transferFee: decimal("transfer_fee", { precision: 15, scale: 2 }).default("0.00"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).default("1.000000"),
  status: varchar("status").default("pending"), // 'pending', 'processing', 'completed', 'failed'
  externalTransactionId: varchar("external_transaction_id"), // Operator's transaction ID
  errorMessage: text("error_message"),
  qrCodeData: jsonb("qr_code_data"), // QR code generation data
  transferMethod: varchar("transfer_method").default("manual"), // 'manual', 'qr_code', 'nfc'
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transfer favorites and templates
export const transferFavorites = pgTable("transfer_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  recipientName: varchar("recipient_name").notNull(),
  recipientPhone: varchar("recipient_phone").notNull(),
  operatorId: varchar("operator_id").references(() => registeredOperators.id).notNull(),
  defaultAmount: decimal("default_amount", { precision: 15, scale: 2 }),
  defaultDescription: varchar("default_description"),
  transferCount: integer("transfer_count").default(0),
  lastUsed: timestamp("last_used").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// QR Code tracking for analytics
export const qrCodeScans = pgTable("qr_code_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  scannerUserId: varchar("scanner_user_id").references(() => users.id),
  qrCodeData: jsonb("qr_code_data").notNull(),
  scanLocation: varchar("scan_location"), // GPS coordinates
  scanMethod: varchar("scan_method").default("camera"), // 'camera', 'upload', 'manual'
  resultAction: varchar("result_action"), // 'transfer_initiated', 'invalid_format', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
});

// Operator API credentials (encrypted)
export const operatorCredentials = pgTable("operator_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operatorId: varchar("operator_id").references(() => registeredOperators.id).notNull(),
  credentialType: varchar("credential_type").notNull(), // 'api_key', 'token', 'certificate'
  credentialValue: text("credential_value").notNull(), // Encrypted value
  environment: varchar("environment").default("sandbox"), // 'sandbox', 'production'
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
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
  documentType: varchar("document_type").notNull(), // 'cni', 'passport', 'proof_address', 'selfie'
  documentUrl: varchar("document_url").notNull(),
  status: varchar("status").default("pending"), // 'pending', 'approved', 'rejected'
  rejectionReason: text("rejection_reason"),
  documentNumber: varchar("document_number"), // CNI or passport number
  expiryDate: timestamp("expiry_date"), // Document expiry date
  verificationScore: decimal("verification_score", { precision: 5, scale: 2 }), // AI verification score
  extractedData: jsonb("extracted_data"), // OCR extracted data
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Multi-currency accounts and international transfers
export const currencies = pgTable("currencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 3 }).notNull().unique(), // ISO 4217 currency codes (USD, EUR, GBP, etc.)
  name: varchar("name").notNull(),
  symbol: varchar("symbol").notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 15, scale: 6 }).notNull(), // Rate against FCFA
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const multiCurrencyAccounts = pgTable("multi_currency_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  currencyId: varchar("currency_id").references(() => currencies.id).notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00"),
  accountNumber: varchar("account_number").notNull(),
  isDefault: boolean("is_default").default(false),
  status: varchar("status").default("active"), // 'active', 'frozen', 'closed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const exchangeRateHistory = pgTable("exchange_rate_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  currencyId: varchar("currency_id").references(() => currencies.id).notNull(),
  rate: decimal("rate", { precision: 15, scale: 6 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const internationalTransfers = pgTable("international_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  fromAccountId: varchar("from_account_id").references(() => multiCurrencyAccounts.id),
  toAccountId: varchar("to_account_id").references(() => multiCurrencyAccounts.id),
  fromCurrencyId: varchar("from_currency_id").references(() => currencies.id).notNull(),
  toCurrencyId: varchar("to_currency_id").references(() => currencies.id).notNull(),
  fromAmount: decimal("from_amount", { precision: 15, scale: 2 }).notNull(),
  toAmount: decimal("to_amount", { precision: 15, scale: 2 }).notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 15, scale: 6 }).notNull(),
  fees: decimal("fees", { precision: 15, scale: 2 }).default("0.00"),
  recipientName: varchar("recipient_name").notNull(),
  recipientAccount: varchar("recipient_account").notNull(),
  recipientBank: varchar("recipient_bank"),
  recipientCountry: varchar("recipient_country").notNull(),
  swiftCode: varchar("swift_code"),
  purpose: varchar("purpose").notNull(),
  reference: varchar("reference").notNull(),
  status: varchar("status").default("pending"), // 'pending', 'processing', 'completed', 'failed', 'cancelled'
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const currencyExchanges = pgTable("currency_exchanges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  fromCurrencyId: varchar("from_currency_id").references(() => currencies.id).notNull(),
  toCurrencyId: varchar("to_currency_id").references(() => currencies.id).notNull(),
  fromAmount: decimal("from_amount", { precision: 15, scale: 2 }).notNull(),
  toAmount: decimal("to_amount", { precision: 15, scale: 2 }).notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 15, scale: 6 }).notNull(),
  fees: decimal("fees", { precision: 15, scale: 2 }).default("0.00"),
  type: varchar("type").notNull(), // 'market', 'limit'
  status: varchar("status").default("completed"), // 'pending', 'completed', 'failed'
  executedAt: timestamp("executed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// International banking partners
export const bankingPartners = pgTable("banking_partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  country: varchar("country").notNull(),
  countryCode: varchar("country_code", { length: 2 }).notNull(), // ISO 3166-1 alpha-2
  swiftCode: varchar("swift_code"),
  supportedCurrencies: jsonb("supported_currencies"), // Array of currency codes
  transferFees: jsonb("transfer_fees"), // Fee structure by currency and amount
  processingTime: varchar("processing_time"), // "1-3 business days"
  isActive: boolean("is_active").default(true),
  logoUrl: varchar("logo_url"),
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

export const insertCurrencySchema = createInsertSchema(currencies).omit({
  id: true,
  lastUpdated: true,
});

export const insertMultiCurrencyAccountSchema = createInsertSchema(multiCurrencyAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertExchangeRateHistorySchema = createInsertSchema(exchangeRateHistory).omit({
  id: true,
  timestamp: true,
});

export const insertInternationalTransferSchema = createInsertSchema(internationalTransfers).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  reference: true,
});

export const insertCurrencyExchangeSchema = createInsertSchema(currencyExchanges).omit({
  id: true,
  createdAt: true,
  executedAt: true,
});

export const insertBankingPartnerSchema = createInsertSchema(bankingPartners).omit({
  id: true,
  createdAt: true,
});

// Insert schemas for new tables
export const insertRegisteredOperatorSchema = createInsertSchema(registeredOperators).omit({
  id: true,
  createdAt: true,
});

export const insertInstantTransferSchema = createInsertSchema(instantTransfers).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

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

export type RegisteredOperator = typeof registeredOperators.$inferSelect;
export type InsertRegisteredOperator = z.infer<typeof insertRegisteredOperatorSchema>;

export type InstantTransfer = typeof instantTransfers.$inferSelect;
export type InsertInstantTransfer = z.infer<typeof insertInstantTransferSchema>;

// Additional types
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

// Currency and international transfer types
export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;
export type MultiCurrencyAccount = typeof multiCurrencyAccounts.$inferSelect;
export type InsertMultiCurrencyAccount = z.infer<typeof insertMultiCurrencyAccountSchema>;
export type ExchangeRateHistory = typeof exchangeRateHistory.$inferSelect;
export type InsertExchangeRateHistory = z.infer<typeof insertExchangeRateHistorySchema>;
export type InternationalTransfer = typeof internationalTransfers.$inferSelect;
export type InsertInternationalTransfer = z.infer<typeof insertInternationalTransferSchema>;
export type CurrencyExchange = typeof currencyExchanges.$inferSelect;
export type InsertCurrencyExchange = z.infer<typeof insertCurrencyExchangeSchema>;
export type BankingPartner = typeof bankingPartners.$inferSelect;
export type InsertBankingPartner = z.infer<typeof insertBankingPartnerSchema>;
