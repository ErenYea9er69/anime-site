/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['s4.anilist.co', 'artworks.thetvdb.com'],
    minimumCacheTTL: 604800, // Cache for 1 week (in seconds)
    formats: ['image/webp'],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;