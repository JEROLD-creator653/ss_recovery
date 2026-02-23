/** @type {import('next').NextConfig} */
const WebpackObfuscator = process.env.NODE_ENV === 'production'
  ? require('webpack-obfuscator')
  : null;

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['sailstudent.sairamit.edu.in', 'dbchangesstudent.edwisely.com'],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // ─── Anti-Clickjacking ───
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // ─── MIME sniffing protection ───
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // ─── Referrer Policy ───
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // ─── DNS Prefetch ───
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // ─── Permissions Policy ───
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // ─── HSTS ───
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // ─── XSS Protection (legacy browsers) ───
          {
            key: 'X-XSS-Protection',
            value: '0',
          },
          // ─── Cross-Origin protections ───
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          // ─── Content Security Policy ───
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://www.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://sailstudent.sairamit.edu.in https://dbchangesstudent.edwisely.com https://www.google.com https://pagead2.googlesyndication.com",
              "connect-src 'self' https://dbchangesstudent.edwisely.com https://*.execute-api.ap-south-1.amazonaws.com https://sailv2.vercel.app https://api.ipify.org https://analytics.google.com https://www.google-analytics.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://pagead2.googlesyndication.com https://www.googletagmanager.com",
              "frame-src https://www.google.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ─── Webpack: JavaScript Obfuscation (production only) ───
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer && WebpackObfuscator) {
      config.plugins.push(
        new WebpackObfuscator(
          {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.5,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.2,
            debugProtection: false,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: true,
            renameGlobals: false,
            selfDefending: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 5,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayEncoding: ['base64'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 2,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersType: 'function',
            stringArrayThreshold: 0.75,
            transformObjectKeys: true,
            unicodeEscapeSequence: false,
          },
          ['excluded_bundle_name.js']
        )
      );
    }
    return config;
  },
};

module.exports = nextConfig;
