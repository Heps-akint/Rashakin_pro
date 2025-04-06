/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions still need to be enabled via experimental flag
  experimental: {
    serverActions: true, // Enable Server Actions
  },
  
  // Image optimization configuration
  images: {
    domains: ['localhost'], // Allow images from localhost
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow any HTTPS image source - can be restricted further for production
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
  },
  
  // Improved output settings
  output: 'standalone', // Optimizes for production deployments
  
  // Performance optimizations
  swcMinify: true, // Use SWC for minification (faster than Terser)
  
  // Environment variable configuration
  env: {
    // Fallback value for the base URL if not set in environment variables
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
