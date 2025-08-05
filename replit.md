# Overview

IPCASH is a modern Pan-African neobank mobile application built with React, Express.js, and PostgreSQL. The application provides comprehensive digital banking services including peer-to-peer transfers, mobile money integration, virtual card management, and transaction tracking. Designed with a mobile-first approach, it targets African markets with support for local payment methods like Orange Money and Wave.

# User Preferences

Preferred communication style: Simple, everyday language.

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
- **Key Entities**: Users, Accounts, Transactions, Cards, Mobile Money Accounts, Contacts
- **Session Storage**: Dedicated sessions table for authentication state

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
- **Mobile Money**: Support for Orange Money and Wave payment providers
- **Card Services**: Virtual card creation and management capabilities

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