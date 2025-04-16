// Bundle analyzer plugin configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_BASE_URL } = process.env;
const supabaseHost = NEXT_PUBLIC_SUPABASE_URL ? new URL(NEXT_PUBLIC_SUPABASE_URL).hostname : 'localhost';

const nextConfig = {
  experimental: {
    serverActions: true, // Enable Server Actions
  },

  images: {
    domains: ['localhost', supabaseHost],
  },

  // Improved output settings
  output: 'standalone',

  // Performance optimizations
  swcMinify: true,

  // Environment variable configuration
  env: {
    NEXT_PUBLIC_BASE_URL: NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
};

// Export with bundle analyzer
module.exports = withBundleAnalyzer(nextConfig);
