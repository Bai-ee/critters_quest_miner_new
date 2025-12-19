/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack config to exclude the critters_quest_miner-main folder
  turbopack: {},
};

module.exports = nextConfig;
