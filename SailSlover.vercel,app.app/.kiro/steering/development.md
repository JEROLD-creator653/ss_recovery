# Development Guidelines

## Working with Static Snapshots
This is a static snapshot of a deployed application. When making changes:
- Modifications to HTML/CSS/JS files are for reference or local testing only
- Changes won't affect the live deployment without rebuilding and redeploying
- The build ID `3mYRGNLzATHBRVYk6byqd` is embedded throughout the snapshot

## Code Modification Best Practices
- Preserve existing hash-based filenames when analyzing code
- Maintain Next.js App Router conventions (layout, page, loading components)
- Keep server/client component boundaries intact
- Respect the existing CSS custom properties for theming

## Authentication Flow
The application uses a dual authentication system:
- OTP-based login (primary method)
- Password-based login (alternative method)
- Both methods require SEC ID as username
- Form submission handlers are client-side rendered

## Styling Conventions
- Use CSS custom properties defined in global styles
- Maintain glassmorphism effects (backdrop-filter with blur)
- Support both light and dark color schemes
- Follow the existing responsive design patterns

## Third-Party Integration Rules
- Google Analytics tracking is configured with ID: G-F7WR3HX216
- AdSense publisher ID: ca-pub-9564119438996773
- All third-party scripts load asynchronously
- Vercel Analytics and Speed Insights are integrated at layout level

## Performance Considerations
- Font files are preloaded for critical rendering path
- CSS precedence is optimized with data-precedence attributes
- JavaScript chunks are code-split and loaded async
- Static assets use content-based hashing for cache optimization
