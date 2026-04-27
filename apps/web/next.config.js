/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@booking-app/ui'],
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
