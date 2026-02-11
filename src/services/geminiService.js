const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
// Using a model alias that refers to a stable version
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function summarizeCommit(commitMessage, diff) {
    const prompt = `
    You are a helpful coding assistant. 
    Explain this git commit to a non-technical person (User) in 1-2 short sentences.
    Focus on "What changed" and "Why it matters".
    Do not mention "technical details" like file names or line numbers unless crucial.
    
    Commit Message: "${commitMessage}"
    Diff Preview: 
    ${diff ? diff.substring(0, 500) : "No diff avaliable"}
    (Note: Diff details would go here if available, but relying on message for now)
    `;

    // Retry logic for Rate Limiting (429)
    let retries = 3;
    let delay = 2000; // Start with 2 seconds

    while (retries > 0) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            if (error.status === 429 || error.message.includes('429')) {
                console.log(`Rate limit hit. Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff: 2s -> 4s -> 8s
                retries--;
            } else {
                console.error("Error generating summary:", error);
                return "Could not generate summary. Check server console for details.";
            }
        }
    }
    return "Summary unavailable (Rate limit exceeded).";
}

module.exports = { summarizeCommit };
