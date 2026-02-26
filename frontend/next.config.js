const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
  webpack: (config) => {
    config.resolve.alias['@/hooks'] = path.resolve(__dirname, 'hooks');
    config.resolve.alias['@/lib'] = path.resolve(__dirname, 'lib');
    config.resolve.alias['@/components'] = path.resolve(__dirname, 'components');
    return config;
  }
}

module.exports = nextConfig
