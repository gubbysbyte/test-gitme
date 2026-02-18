const { summarizeCommit } = require('../services/geminiService');
const { sendCommitNotification, sendPRNotification, sendIssueNotification } = require('../services/discordService');

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

    if (event === 'pull_request') {
        const payload = req.body;
        const action = payload.action;
        const pr = payload.pull_request;
        const repoName = payload.repository.name;
        
        // Only process main actions to avoid spam (e.g., ignore 'labeled', 'assigned')
        if (['opened', 'closed', 'reopened'].includes(action)) {
            const authorName = pr.user.login;
            const authorAvatar = pr.user.avatar_url;
            const prTitle = pr.title;
            const prUrl = pr.html_url;
            const prBody = pr.body || '';
            const baseBranch = pr.base.ref;
            const headBranch = pr.head.ref;
            const timestamp = pr.updated_at || pr.created_at;
            const isMerged = pr.merged || false;

            await sendPRNotification(
                repoName,
                action,
                prTitle,
                prUrl,
                prBody,
                authorName,
                authorAvatar,
                baseBranch,
                headBranch,
                timestamp,
                isMerged
            );
        }
        return res.status(200).send('PR Event processed');
    }

    if (event === 'issues') {
        const payload = req.body;
        const action = payload.action;
        const issue = payload.issue;
        const repoName = payload.repository.name;

        if (['opened', 'closed', 'reopened'].includes(action)) {
            const authorName = issue.user.login;
            const authorAvatar = issue.user.avatar_url;
            const issueTitle = issue.title;
            const issueUrl = issue.html_url;
            const issueBody = issue.body || '';
            const timestamp = issue.updated_at || issue.created_at;

            await sendIssueNotification(
                repoName,
                action,
                issueTitle,
                issueUrl,
                issueBody,
                authorName,
                authorAvatar,
                timestamp
            );
        }
        return res.status(200).send('Issue Event processed');
    }

    res.status(200).send('Event received');
};

module.exports = { handleWebhook };
