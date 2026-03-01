// Usage: node test-manual-events.js [issue|pr|push]
// Example: node test-manual-events.js issue

const type = process.argv[2] || 'issue';
const url = 'http://localhost:3000/webhook'; // Change to your ngrok URL if testing externally

console.log(`🚀 Sending test event: ${type.toUpperCase()} to ${url}...`);

const commonUser = {
    login: 'TestUser',
    avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
};

const payloads = {
    issue: {
        event: 'issues',
        data: {
            action: 'opened',
            repository: { name: 'gitme-test-repo' },
            issue: {
                title: 'bug: application crashes on startup',
                html_url: 'https://github.com/test/gitme/issues/101',
                body: 'The application fails to load config variables when .env is missing.',
                user: commonUser,
                created_at: new Date().toISOString()
            }
        }
    },
    pr: {
        event: 'pull_request',
        data: {
            action: 'opened',
            repository: { name: 'gitme-test-repo' },
            pull_request: {
                title: 'feat: add dark mode support',
                html_url: 'https://github.com/test/gitme/pull/102',
                body: 'Implemented dark mode toggle using Tailwind CSS.',
                user: commonUser,
                base: { ref: 'main' },
                head: { ref: 'feat/dark-mode' },
                created_at: new Date().toISOString(),
                merged: false
            }
        }
    },
    push: {
        event: 'push',
        data: {
            ref: 'refs/heads/main',
            repository: { name: 'gitme-test-repo' },
            pusher: { name: 'TestUser' },
            sender: commonUser,
            commits: [
                {
                    id: 'a1b2c3d4e5f6',
                    message: 'fix: resolve memory leak in webhook controller',
                    url: 'https://github.com/test/gitme/commit/a1b2c3d',
                    timestamp: new Date().toISOString(),
                    author: { name: 'TestUser' }
                }
            ]
        }
    }
};

const selected = payloads[type];

if (!selected) {
    console.error(`❌ Unknown type: ${type}. Use 'issue', 'pr', or 'push'.`);
    process.exit(1);
}

async function sendWebhook() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-github-event': selected.event
            },
            body: JSON.stringify(selected.data)
        });

        if (response.ok) {
            console.log(`✅ Success! Server responded with: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.log(`   Response Body: ${text}`);
        } else {
            console.error(`❌ Error: Server responded with ${response.status}`);
            console.error(await response.text());
        }
    } catch (error) {
        console.error("❌ Failed to connect to server. Is 'npm start' running?");
        console.error(error.message);
    }
}

sendWebhook();