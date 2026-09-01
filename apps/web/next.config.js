//@ts-check

const { join } = require('node:path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: join(__dirname, '..', '..'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.dummyjson.com',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['@kitchen/schemas', '@kitchen/utils'],
}

module.exports = nextConfig
