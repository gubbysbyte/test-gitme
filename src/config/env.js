require('dotenv').config();

const requiredEnv = ['DISCORD_TOKEN', 'DISCORD_CHANNEL_ID'];

// Validate specific keys are present
requiredEnv.forEach(key => {
    if (!process.env[key]) {
        console.error(`❌ Missing required environment variable: ${key}`);
        process.exit(1);
    }
});

const hasLMStudioConfig = Boolean(process.env.LM_STUDIO_BASE_URL && process.env.LM_STUDIO_MODEL);

if (!hasLMStudioConfig) {
    console.warn('LM Studio config not found. AI commit summaries are disabled.');
}

module.exports = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
    LM_STUDIO_BASE_URL: process.env.LM_STUDIO_BASE_URL,
    LM_STUDIO_MODEL: process.env.LM_STUDIO_MODEL,
    AI_SUMMARY_ENABLED: hasLMStudioConfig,
    PORT: process.env.PORT || 3000
};
