# Debugging and Troubleshooting

## Common Issues with Static Snapshots

### Asset Path Resolution
- All paths are relative to the domain root
- `/_next/static/` paths won't work without a local server
- Font files require proper CORS headers
- Third-party resources are cached locally by domain

### Hydration Mismatches
- Server-rendered HTML must match client-side React output
- Check for conditional rendering based on browser APIs
- Verify date/time rendering consistency
- Look for `BAILOUT_TO_CLIENT_SIDE_RENDERING` markers

### Authentication Flow Issues
- Form buttons use `type="button"` (not submit)
- Event handlers attached via client-side JavaScript
- Check browser console for hydration errors
- Verify SEC ID input validation

## Debugging Tools

### Browser DevTools
- Network tab: Check for failed resource loads
- Console: Look for React hydration warnings
- Application tab: Inspect cookies and local storage
- Performance tab: Analyze loading bottlenecks

### Next.js Specific
- React DevTools: Inspect component tree
- Check for client/server component boundaries
- Verify Suspense boundaries and loading states
- Monitor for unnecessary re-renders

## Performance Debugging
- Lighthouse audit for Core Web Vitals
- Check font loading strategy (FOIT vs FOUT)
- Verify lazy loading of JavaScript chunks
- Monitor third-party script impact (Analytics, AdSense)

## Analytics Verification
- Confirm GA4 pageview events fire
- Check gtag configuration in browser console
- Verify AdSense ad units load correctly
- Test Vercel Analytics integration

## Common Error Patterns
- 404s for missing static assets
- CORS errors for font files
- CSP violations from inline scripts
- Hydration errors from dynamic content
