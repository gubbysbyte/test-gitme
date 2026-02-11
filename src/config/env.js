require('dotenv').config();

const requiredEnv = ['DISCORD_TOKEN', 'DISCORD_CHANNEL_ID', 'GEMINI_API_KEY'];

// Validate specific keys are present
requiredEnv.forEach(key => {
    if (!process.env[key]) {
        console.error(`❌ Missing required environment variable: ${key}`);
        process.exit(1);
    }
});

module.exports = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    PORT: process.env.PORT || 3000
};
