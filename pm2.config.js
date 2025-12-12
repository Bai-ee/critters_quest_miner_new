// pm2.config.js
module.exports = {
  apps: [
    {
      name: "critters_quest_miner", // A name for your application
      script: "npm",
      args: "run start", // This runs the 'start' script in your package.json
      env: {
        NODE_ENV: "production",
        PORT: 3001, // Specify your custom port here
      },
    },
  ],
};