require('dotenv').config();

const requiredEnv = ['DISCORD_TOKEN', 'DISCORD_CHANNEL_ID', 'LM_STUDIO_BASE_URL', 'LM_STUDIO_MODEL'];

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
    LM_STUDIO_BASE_URL: process.env.LM_STUDIO_BASE_URL,
    LM_STUDIO_MODEL: process.env.LM_STUDIO_MODEL,
    PORT: process.env.PORT || 3000
};
