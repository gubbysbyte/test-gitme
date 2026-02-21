// Node.js v18+ has built-in fetch, so we don't need to import it.

async function sendTestWebhook() {
    const payload = {
        ref: "refs/heads/main",
        repository: {
            name: "ravaki",
            html_url: "https://github.com/test/ravaki"
        },
        pusher: {
            name: "Himanshu"
        },
        sender: {
            avatar_url: "https://avatars.githubusercontent.com/u/12345678?v=4"
        },
        commits: [
            {
                id: "6ccfdf5",
                message: "feat(agency-advertiser): Agency Account Manager flows, advertiser approval, invite page, transaction history",
                timestamp: new Date().toISOString(),
                url: "https://github.com/test/ravaki/commit/6ccfdf5",
                author: {
                    name: "Atul"
                }
            }
        ]
    };

    console.log("Sending test payload to http://localhost:3000/webhook ...");

    try {
        const response = await fetch('http://localhost:3000/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': 'push'
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
