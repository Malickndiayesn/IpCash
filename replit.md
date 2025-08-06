# Overview

IPCASH is a comprehensive Pan-African neobank mobile application built with React, Express.js, and PostgreSQL. The application provides full digital banking services including peer-to-peer transfers, mobile money integration, virtual card management, transaction tracking, AI-powered financial analytics, automated savings, intelligent credit scoring, and international banking capabilities. 

**Recent Major Enhancement (January 2025):** Complete QR code integration for instant transfers between all registered operators (IPCASH Wallet, Orange Money, Wave) with advanced fee optimization, transfer limits tracking, and comprehensive transaction analytics.

Designed with a mobile-first approach, it targets African markets with support for local payment methods while offering global financial services including multi-currency accounts, international transfers, and currency exchange.

# User Preferences

Preferred communication style: Simple, everyday language.
User language: French - User prefers responses and interface in French.
Application focus: Mobile banking for African markets (UEMOA region).

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with JSON responses

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Drizzle migrations with schema versioning
- **Key Entities**: Users, Accounts, Transactions, Cards, Mobile Money Accounts, Contacts, KYC Documents, Savings Goals, Credit Scores, Loan Requests, Financial Insights, Support Tickets, Currencies, Multi-Currency Accounts, International Transfers, Currency Exchanges, Banking Partners, Registered Operators, Instant Transfers, Transfer Favorites, QR Code Scans
- **Session Storage**: Dedicated sessions table for authentication state
- **Advanced Features**: Multi-currency support, international banking, AI analytics, automated savings, credit scoring, QR code transfers, instant inter-operator transfers, intelligent fee optimization, real-time transfer limits tracking

## Authentication & Authorization
- **Provider**: Replit Auth using OpenID Connect protocol
- **Session Strategy**: Server-side sessions with secure HTTP-only cookies
- **Middleware**: Route-level authentication guards
- **User Management**: Automatic user provisioning on first login

## Mobile-First Design
- **Responsive Layout**: Tailored for mobile screens with desktop fallbacks
- **Navigation**: Bottom navigation bar for mobile accessibility
- **PWA Ready**: Configured for progressive web app capabilities
- **Touch Optimized**: Large touch targets and gesture-friendly interactions

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Authentication Services
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware with OpenID strategy

## Payment Integrations
- **Mobile Money**: Support for Orange Money and Wave payment providers with instant transfers
- **Card Services**: Virtual card creation and management capabilities
- **International Banking**: SWIFT-enabled transfers to global banking partners
- **Currency Exchange**: Real-time exchange rates with multi-currency support
- **Banking Partners**: Integration with Wells Fargo, HSBC, BNP Paribas, Deutsche Bank
- **QR Code System**: Complete QR code generation and scanning for instant transfers between all operators
- **Fee Optimization**: Intelligent fee calculator with cost optimization recommendations
- **Transfer Limits**: Real-time tracking of daily and monthly transfer limits with alerts

## UI & Design System
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework

## Development Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **ESBuild**: JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and schema management CLI

## Third-Party Libraries
- **TanStack Query**: Data fetching and caching solution
- **React Hook Form**: Form state management and validation
- **Zod**: TypeScript-first schema validation
- **date-fns**: Date manipulation utilities
- **Wouter**: Minimalist routing library

## Recent Changes (January 2025)

### QR Code Transfer System
- **QRCodeGenerator Component**: Complete QR code generation with configurable amounts and descriptions
- **QRCodeScanner Component**: Camera-based QR scanning with manual input fallback
- **Transfer Integration**: Automatic form population from scanned QR codes
- **Cross-Operator Support**: Seamless transfers between IPCASH, Orange Money, and Wave

### Enhanced Transfer Features
- **FeeCalculator Component**: Real-time fee calculation with optimization suggestions
- **TransferLimitsCard Component**: Visual progress tracking of daily/monthly limits
- **TransferHistory Component**: Advanced filtering and analytics for transaction history
- **Instant Transfer API**: Complete backend integration for multi-operator transfers

### UI/UX Improvements
- **Progress Component**: Visual progress indicators for limits and loading states
- **Badge Component**: Status indicators and categorization labels
- **Popover Component**: Contextual help and information displays
- **Mobile Navigation**: Enhanced with instant transfer quick access