const config = require('../config/env');

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
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${config.GEMINI_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://github.com/gitme",
                    "X-Title": "GitMe"
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
                    "messages": [{ "role": "user", "content": prompt }]
                })
            });

            if (response.status === 429) throw new Error('429 Rate Limit');
            if (!response.ok) throw new Error(`OpenRouter API Error: ${response.status}`);

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            if (error.message.includes('429')) {
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
