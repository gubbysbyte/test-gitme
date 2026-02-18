const { summarizeCommit } = require('../services/geminiService');
const { sendCommitNotification } = require('../services/discordService');

const handleWebhook = async (req, res) => {
    const event = req.headers['x-github-event'];

    if (event === 'ping') {
        return res.status(200).send('Pong!');
    }

    if (event === 'push') {
        const payload = req.body;
        const repoName = payload.repository.name;
        const pusherName = payload.pusher.name;
        const commits = payload.commits;
        const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : 'unknown';
        const avatarUrl = payload.sender ? payload.sender.avatar_url : '';

        // Process only the latest commit to avoid spam
        if (commits && commits.length > 0) {
            const latestCommit = commits[commits.length - 1]; // or iterates all
            // For now, let's just do the latest one or maybe all? 
            // The original code did "commits.forEach", let's replicate that logic properly.
            // Actually original code iterate ALL commits.

            console.log(`Received push event for ${repoName} by ${pusherName}`);

            // We will process them sequentially to avoid rate limits? 
            // Or just fire and forget. Let's do sequential for safety with the retry logic.

            for (const commit of commits) {
                const message = commit.message;
                const url = commit.url;
                const timestamp = commit.timestamp;
                const authorForThisCommit = commit.author.name;
                const commitHash = commit.id;

                // 1. Generate AI Summary
                const summary = await summarizeCommit(message, null); // Diff is null for now

                // 2. Send to Discord
                await sendCommitNotification(
                    repoName,
                    branch,
                    authorForThisCommit, // Use commit author, not just pusher
                    message,
                    url,
                    summary,
                    timestamp,
                    commitHash,
                    avatarUrl
                );
            }
        }
        return res.status(200).send('Webhook processed');
    }

    res.status(200).send('Event received');
};

module.exports = { handleWebhook };
