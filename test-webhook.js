// Node.js v18+ has built-in fetch, so we don't need to import it.

async function sendTestWebhook() {
    const payload = {
        ref: "refs/heads/main",
        repository: {
            name: "gitme-test-repo",
            html_url: "https://github.com/test/gitme-test-repo"
        },
        pusher: {
            name: "TestUser"
        },
        commits: [
            {
                id: "test-commit-id",
                message: "feat: implemented the new login screen with dark mode",
                timestamp: new Date().toISOString(),
                url: "https://github.com/test/gitme-test-repo/commit/test-commit-id",
                author: {
                    name: "TestUser"
                }
            }
        ]
    };

    console.log("Sending test payload to http://localhost:3000/webhook ...");

    try {
        const response = await fetch('http://localhost:3000/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log("✅ Webhook sent successfully! Check your Discord channel.");
        } else {
            console.error(`❌ Server returned error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
        }
    } catch (error) {
        console.error("❌ Failed to send webhook. Is the server running? (npm start)");
        console.error(error);
    }
}

sendTestWebhook();
