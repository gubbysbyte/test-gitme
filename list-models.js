require('dotenv').config();

const start = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found in .env");
        return;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`Querying: https://generativelanguage.googleapis.com/v1beta/models?key=HIDDEN`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const data = await response.json();
        if (data.models) {
            console.log("\n✅ Available Models:");
            data.models.forEach(m => {
                // Filter for models that support generateContent
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("No models found?", data);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
};

start();
