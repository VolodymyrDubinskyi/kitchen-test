//@ts-check

const { join } = require('node:path')

const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
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
