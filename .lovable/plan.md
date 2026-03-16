

# PreciseDM — Phase 1: Onboarding + Authentication

## Overview
Build a mobile-first medical app with onboarding flow and full authentication using Lovable Cloud (Supabase). Clinical design with teal/white/slate palette, Inter font, smooth Framer Motion transitions.

## Screens to Build

### 1. Splash Screen
- Centered layout with placeholder logo (teal gradient square, 80px)
- "Welcome to PreciseDM" heading + subtitle
- Fixed bottom "Next" button with safe area padding

### 2. Features Screen
- Title + 4 feature cards (Initial dosing, Steroid dosing, Pregnancy care, Ongoing maintenance)
- Cards with teal icons, staggered entrance animation (0.05s delay)
- "Next" button

### 3. Get Started Screen
- "Your journey begins here" + motivational copy
- "Get Started" button → navigates to Login

### 4. Login Screen
- Logo placeholder at top
- Email + Password fields with validation
- "Login" button, "Forgot Password" link, "Skip" link
- "Don't have an account? Sign Up" text link
- Skip enters a limited preview mode (stored in app state)

### 5. Sign Up Screen
- Fields: Full Name, Email, Password, Confirm Password, User Type dropdown (Student/Practitioner), Custom User ID (optional)
- Terms checkbox with validation
- All validation rules enforced client-side
- On success → show "Registration successful" message → redirect to Login (no auto-login)

### 6. Forgot Password Screen
- Email input → triggers Supabase password reset
- Reset Password page at `/reset-password` for completing the flow

## Backend (Lovable Cloud)

### Database
- **profiles** table: `id` (FK to auth.users), `full_name`, `user_type` (student/practitioner), `custom_user_id`, `accepted_terms`, `created_at`, `last_login`
- **user_roles** table with proper enum and `has_role()` security definer function
- RLS policies: users can only read/update their own profile
- Trigger to auto-create profile on signup

### Auth
- Supabase email/password authentication
- Built-in auth emails for verification and password reset
- `onAuthStateChange` listener pattern

## Design System
- **Colors**: Primary teal `hsl(172, 66%, 40%)`, foreground `hsl(215, 25%, 15%)`, muted `hsl(215, 15%, 50%)`
- **Typography**: Inter font, semibold headings with tight tracking, relaxed body text
- **Components**: Rounded-xl buttons (h-12), ring-based inputs on slate-50, layered shadows
- **Motion**: Framer Motion slide transitions, linear-out easing, staggered lists
- **Anti-patterns enforced**: No pure black, no bouncy animations, no floating labels, no solid borders

## Architecture
- Modular page components under `/pages/`
- Auth context/hook for session management
- Form validation with zod schemas
- Shared UI components styled per design brief
- All logo/image slots use placeholders, easily swappable

