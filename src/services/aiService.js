const config = require('../config/env');

async function summarizeCommit(commitMessage, diff) {
    if (!config.AI_SUMMARY_ENABLED) {
        return `Code was updated: ${commitMessage}`;
    }

    const prompt = `
    You are a helpful coding assistant. 
    Explain this git commit to a non-technical person (User) in 1-2 short sentences.
    Focus on "What changed" and "Why it matters".
    Do not mention "technical details" like file names or line numbers unless crucial.
    
    Commit Message: "${commitMessage}"
    Diff Preview: 
    ${diff ? diff.substring(0, 500) : "No diff available"}
    `;

    try {
        const response = await fetch(`${config.LM_STUDIO_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: config.LM_STUDIO_MODEL,
                messages: [
                    { role: "system", content: "You are a helpful coding assistant that summarizes git commits for non-technical users." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`LM Studio API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error generating summary with LM Studio:", error);
        return `Code was updated: ${commitMessage}`;
    }
}

module.exports = { summarizeCommit };
