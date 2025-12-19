/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude the critters_quest_miner-main folder from build
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/critters_quest_miner-main/**'],
    };
    return config;
  },
};

module.exports = nextConfig;
