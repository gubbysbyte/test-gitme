const https = require('https');

// The URL you said you are using:
const webhookUrl = 'https://pseudoasymmetrical-unnegotiable-anabella.ngrok-free.dev/webhook';

const payload = JSON.stringify({
    repository: { name: 'ngrok-test-repo', html_url: 'http://github.com/ngrok-test' },
    pusher: { name: 'NgrokTester' },
    commits: [
        {
            id: '123456',
            message: 'testing ngrok connectivity',
            url: 'http://github.com/ngrok-test/commit/123456',
            timestamp: new Date().toISOString(),
            author: { name: 'NgrokTester' }
        }
    ]
});

const url = new URL(webhookUrl);
const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'X-GitHub-Event': 'push'
    }
};

console.log(`Sending payload to ${webhookUrl}...`);

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(`Error: ${error.message}`);
});

req.write(payload);
req.end();
