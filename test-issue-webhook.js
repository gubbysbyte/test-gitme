// Node.js v18+ has built-in fetch
async function sendTestIssueWebhook() {
    const payload = {
        action: "opened",
        issue: {
            title: "full blog page",
            html_url: "https://github.com/test/ravaki/issues/2",
            body: "full blog page should be there",
            user: {
                login: "kailash1602-exe",
                avatar_url: "https://avatars.githubusercontent.com/u/89665510?v=4"
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        repository: {
            name: "ravaki"
        }
    };

    console.log("Sending test issue payload to http://localhost:3000/webhook ...");

    try {
        const response = await fetch('http://localhost:3000/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': 'issues'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log("✅ Issue webhook sent successfully! Check your Discord channel.");
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

sendTestIssueWebhook();
