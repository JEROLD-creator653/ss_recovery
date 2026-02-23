# Architecture Patterns

## Next.js App Router Structure
This application follows Next.js 13+ App Router conventions:
- Server Components by default
- Client Components marked with 'use client' directive
- Layout wraps all pages with Analytics and SpeedInsights
- Loading states handled via loading.js
- Error boundaries via error.js (if present)

## Component Hierarchy
```
layout.js (root)
├── Analytics (Google Analytics)
├── SpeedInsights (Vercel)
├── AdSense Script
└── page.js (home/login)
    └── loading.js (suspense fallback)
```

## Rendering Strategy
- Server-side rendering (SSR) for initial page load
- Client-side hydration for interactivity
- Bailout to client rendering for dynamic components
- Static asset optimization through Webpack

## State Management
- Form state managed client-side
- No global state management library detected
- Authentication state likely managed via cookies/sessions
- Client-side navigation via Next.js router

## Styling Architecture
- CSS Modules for component-scoped styles
- Global styles for theme variables and resets
- Custom properties for dynamic theming
- Glassmorphism implemented via backdrop-filter

## Data Flow
- Login form captures SEC ID
- Authentication method selection (OTP vs Password)
- Client-side validation before submission
- Server-side authentication (endpoint not visible in snapshot)

## Build Output Organization
- Webpack chunks split by route and shared dependencies
- Main app bundle contains core React/Next.js runtime
- Route-specific bundles loaded on demand
- Polyfills loaded conditionally for older browsers
