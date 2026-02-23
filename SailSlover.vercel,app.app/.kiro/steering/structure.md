# Project Structure

## Overview
This repository contains a static snapshot of a deployed Next.js application, organized by domain/service with third-party resources cached locally.

## Directory Organization

### Application Root
- `sailv2.vercel.app/` - Main application directory
  - `index.html` - Entry point with server-rendered HTML
  - `favicon.ico` - Application icon

### Next.js Build Artifacts
- `sailv2.vercel.app/_next/` - Next.js build output
  - `static/chunks/` - JavaScript bundles
    - `app/` - App Router page components
    - `webpack-*.js` - Webpack runtime
    - `main-app-*.js` - Main application bundle
    - Numbered chunks (215, 236, 300, etc.) - Code-split modules
  - `static/css/` - Compiled stylesheets
  - `static/media/` - Font files and static assets

### Vercel Integration
- `sailv2.vercel.app/_vercel/` - Vercel platform features
  - `insights/` - Analytics scripts and views
  - `speed-insights/` - Performance monitoring

### Third-Party Resources
Cached external dependencies organized by domain:
- `fonts.googleapis.com/` - Google Fonts CSS
- `fonts.gstatic.com/` - Font files (Poppins family)
- `analytics.google.com/` - GA4 tracking scripts
- `www.googletagmanager.com/` - GTM and analytics
- `pagead2.googlesyndication.com/` - AdSense scripts
- `googleads.g.doubleclick.net/` - Ad serving infrastructure
- `ep1.adtrafficquality.google/` & `ep2.adtrafficquality.google/` - Ad quality monitoring
- `www.google.com/recaptcha/` - reCAPTCHA integration
- `_DataURI/` - Base64 encoded data URIs

## File Naming Conventions
- Next.js chunks: `[name]-[hash].js` format
- CSS files: `[hash].css` format
- Font files: `[hash]-s.p.woff` format
- Build ID: `3mYRGNLzATHBRVYk6byqd`

## Key Files
- `index.html` - Server-rendered page with inline scripts and hydration data
- `layout-*.js` - Root layout component with Analytics and SpeedInsights
- `page-*.js` - Home page component
- `loading-*.js` - Loading UI component
- CSS files contain global styles and component-specific styles

## Configuration Location
- `.kiro/steering/` - AI assistant steering rules and project documentation
