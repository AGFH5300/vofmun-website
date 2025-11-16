# VOFMUN - Voices of the Future Model United Nations

## Overview

VOFMUN is a youth-driven Model United Nations platform that brings together tomorrow's leaders to debate, collaborate, and create solutions for global challenges. The application serves as a comprehensive conference management system featuring registration, resource distribution, committee information, and founder profiles. Built as a modern web application, it provides an engaging digital experience for delegates preparing for and participating in the Model UN conference.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Environment setup

Copy `.env.example` to `.env.local` (or whichever file your hosting provider reads) and populate each value with your real
credentials. The new email automation relies on `RESEND_API_KEY` being present so the signup API can talk to Resend and send the
"payment confirmed" / "complete your payment" emails from `no-reply@vofmun.org`.

### Frontend Architecture
- **Framework**: Next.js 14 with App Router for server-side rendering and optimal performance
- **Styling**: Tailwind CSS with custom design system using VOFMUN brand colors (#B22222 primary red, #ffecdd background cream)
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interfaces
- **Typography**: Custom font stack using Poppins and Lato for professional appearance
- **Icons**: Lucide React for consistent iconography throughout the application

### Component Architecture
- **Modular Design**: Organized component structure with reusable UI components and page-specific components
- **Interactive Elements**: Client-side components for dynamic features like carousels, countdowns, and form handling
- **Responsive Design**: Mobile-first approach with adaptive layouts for all screen sizes

### Page Structure
- **Home Page**: Hero section with countdown timer, interactive features, and conference highlights
- **Resources Page**: Conference schedule, committee information, rules and procedures
- **Signup Page**: Comprehensive registration form with validation and information sections
- **Founders Page**: Team profiles and organizational information
- **Committee Pages**: Detailed information for each UN committee (GA1, ECOSOC, WHO, UNODC, UNSC, ICJ)

### State Management
- **React Hooks**: useState and useEffect for local component state management
- **Form Handling**: React Hook Form with Zod validation for robust form processing
- **Client-Side Interactions**: Custom hooks for mobile detection and toast notifications

### Design System
- **Color Palette**: Professional diplomatic theme with VOFMUN red (#B22222) as primary color
- **Custom CSS**: Additional styling for animations, hover effects, and specialized components
- **Theme Support**: Built-in dark mode support with CSS variables for easy theme switching

## External Dependencies

### UI and Styling
- **Radix UI**: Complete set of accessible component primitives for dialogs, dropdowns, forms, and navigation
- **Tailwind CSS**: Utility-first CSS framework for rapid styling and responsive design
- **class-variance-authority**: Type-safe component variants for consistent styling patterns
- **clsx**: Utility for conditional CSS class concatenation

### Functionality Libraries
- **React Hook Form**: Form state management and validation
- **date-fns**: Date manipulation and formatting utilities
- **Embla Carousel**: Touch-friendly carousel component for image and content sliders
- **cmdk**: Command palette implementation for enhanced navigation

### Development Tools
- **TypeScript**: Static type checking for improved code reliability
- **ESLint**: Code linting for consistent code quality
- **Autoprefixer**: Automatic CSS vendor prefixing

### Font and Assets
- **Google Fonts**: Poppins and Lato font families for typography
- **Geist**: Additional font option for UI elements
- **Lucide React**: Comprehensive icon library for UI elements

### Potential Future Integrations
The architecture is designed to accommodate future additions such as:
- Database integration (likely PostgreSQL with Drizzle ORM)
- Authentication systems for delegate accounts
- Payment processing for registration fees
- Email services for communication
- Real-time features for live conference updates