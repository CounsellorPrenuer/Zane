# Academy for Skill and Knowledge (ASK) - Professional Portfolio Website

## Overview

ASK is a professional portfolio and business website for Academy for Skill and Knowledge, founded by Zane E. Cuxton in 1995 as "The Anvil to Shape Careers." Zane is a globally recognized behavioural trainer, body language and face reading expert, and transformational mentor with over four decades of experience. In 2000, he also founded the Face Readers Foundation of the World (FRFW), pioneering the integration of face reading, body language analysis, and micro-expression techniques into professional development. The platform showcases his expertise in behavioural skills, emotional intelligence, leadership development, and human dynamics, having trained over 500,000 individuals, 1000+ corporates, and 1200+ education institutions through 5000+ workshops globally. His work has been featured on BBC, Discovery, STAR Network, Times of India, and numerous other media outlets.

## Recent Changes (October 16, 2025)

### AI-Powered Blog Writing Feature
- **OpenAI Integration**: Set up Replit's AI Integrations service for OpenAI-compatible API access without requiring personal API keys
- **AI Blog Generation Service**: Created `server/openai.ts` utility using GPT-5 model for professional blog content generation
- **Backend API**: Added `/api/admin/blogs/generate` endpoint (admin-only) for AI blog generation with validation
- **AI Blog Creation Modal**: Built `AIBlogCreationModal` component with:
  - AI generation section with topic, keywords, tone/style, and word count inputs
  - "Generate Blog Post" button that uses AI to create content
  - Auto-population of form fields with AI-generated content (title, content, summary, slug, tags, SEO metadata)
  - Traditional blog form fields for manual editing and finalization
- **Admin Integration**: Updated AdminBlogs page to use new modal instead of basic dialog
- **User Experience**: Smart AI writing flow - generate content → review/edit → publish

## Recent Changes (October 1, 2025)

### Mentoria Payment Integration
- **Full Payment System**: Integrated Razorpay payment gateway for Mentoria partnership programs
- **Shared Pricing Configuration**: Created `shared/pricing.ts` as single source of truth for all Mentoria pricing (frontend and backend)
- **Payment Modal**: Built MentoriaPaymentModal component with form validation, payment processing, and success handling
- **Security Implementation**: 
  - Server-authoritative pricing (backend recalculates all prices)
  - Razorpay signature verification for payment authenticity
  - Order ID storage and verification to prevent payment reuse attacks
  - Rate limiting (5 requests per 15 minutes) on booking endpoints
- **Database Schema**: Added `mentoriaBookings` table with payment tracking, order ID storage, and booking status management
- **Admin Dashboard Integration**: 
  - Display Mentoria bookings with payment status and details
  - Export functionality for all booking types (consultations, workshops, Mentoria)
  - Updated stats calculation to include Mentoria bookings
- **Payment Flow**: Modal collects details → Creates booking → Generates Razorpay order → Processes payment → Verifies signature and order ID → Updates status
- **Interactive CTAs**: Mentoria "BUY NOW" buttons now open payment modal instead of scrolling to contact section

### Unified Programs & Pricing Section
- **Restructured Architecture**: Merged pricing functionality into Workshops component as a unified "Programs & Pricing" section
- **Two-View Toggle System**: Implemented program type toggle with ASK Individual Programs (default) and Mentoria Partnership Programs
- **ASK Individual Programs (Default)**: Displays 6 workshop cards with registration modal integration
- **Mentoria Partnership Programs**: 4 category tabs (8-9 Students, 10-12 Students, College Graduates, Working Professionals) with Standard and Premium pricing tiers for each
- **Component Cleanup**: Removed standalone Pricing component; consolidated all pricing into Workshops.tsx
- **Design Compliance**: Removed custom hover color classes from Buttons to rely on built-in elevation utilities per design guidelines

### Workshop Registration System Simplification
- **Removed Payment Integration**: Simplified workshop registrations to use a form-based approach without payment processing
- **Database Schema Updates**: Modified `workshopRegistrations` table to include workshopTitle, status (pending/confirmed/cancelled), and notes fields; removed paymentStatus and paymentId
- **New Components**: Created WorkshopRegistrationModal using shared schema validation with zodResolver and react-hook-form
- **Admin Dashboard Enhancements**: 
  - Unified bookings view combining consultation requests and workshop registrations
  - Added workshop title column to registrations display
  - Fixed metrics calculations (Completed metric now only counts completed consultations)
  - Updated React Query cache invalidation to use correct admin endpoints
- **Security Improvements**: Added rate limiting to workshop registration endpoint (5 requests per 15 minutes)
- **Form Validation**: Implemented proper TypeScript types using insertWorkshopRegistrationSchema with .extend() for client-side validation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design system following professional education platform aesthetics
- **UI Components**: Radix UI primitives with custom shadcn/ui component library for consistent, accessible interfaces
- **Animations**: Framer Motion for smooth page transitions and interactive elements
- **State Management**: TanStack Query for server state management and caching
- **Theme System**: Custom light/dark mode support with CSS variables and system preference detection

### Design System
- **Color Palette**: Professional blue primary (#220 85% 25%), clean white backgrounds, success orange accents
- **Typography**: Inter font family for clean, professional appearance
- **Layout**: Single-page application with section-based scrolling and responsive 12-column grid
- **Component Library**: Comprehensive UI kit with cards, buttons, forms, navigation, and specialized components

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript for full-stack type safety
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple
- **API Design**: RESTful endpoints with centralized error handling and request logging

### Content Structure
- **Sections**: Hero, About, Services, Programs & Pricing (Workshops), Trust Highlights, Contact, Mentoria Partnership
- **Services**: Behavioural Skills Training, Face Reading & Body Language Workshops, Leadership Development, Emotional Intelligence Programs
- **Programs & Pricing**: Unified section with ASK Individual Programs (6 workshops with registration) and Mentoria Partnership Programs (4 categories with pricing tiers)
- **Workshop Management**: Simple form-based registration system without payment processing (registrations stored with status tracking)
- **Contact Information**: Phone (+91 9844324100), Email (asktrainersblore@gmail.com), Location (Lingarajapuram, Bangalore – 560 084)
- **Social Integration**: LinkedIn, Instagram, Twitter/X profile links

### Development Workflow
- **Environment**: Development mode with hot reloading and runtime error overlays
- **Build Process**: Vite build with esbuild for server-side bundling
- **Database Migrations**: Drizzle Kit for schema management and database pushes
- **Asset Management**: Static asset handling through Vite with path resolution

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database with connection pooling
- **CDN**: Google Fonts for Inter typography
- **Asset Hosting**: Local asset management with Vite static serving

### Development Tools
- **Runtime Error Handling**: Replit-specific error modal for development environment
- **Code Cartographer**: Replit development tooling for enhanced debugging (development only)

### Social Media Integration
- **LinkedIn**: Professional profile integration (https://www.linkedin.com/in/zane-cuxton-b105bb7)
- **Instagram**: Social media presence (placeholder URLs for future implementation)
- **Twitter/X**: Social media engagement (placeholder URLs for future implementation)

### External Services Integration
- **Mentoria**: Partnership with EdTech platform for enhanced learning solutions
- **Contact Forms**: Basic form handling with toast notifications (ready for external service integration)

### UI Libraries
- **Radix UI**: Comprehensive accessible component primitives for complex UI elements
- **Lucide React**: Modern icon library for consistent visual language
- **TanStack Query**: Advanced server state management with caching and synchronization
- **Framer Motion**: Professional animation library for enhanced user experience