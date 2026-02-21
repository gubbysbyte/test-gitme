const { summarizeCommit } = require('../services/geminiService');
const { sendCommitNotification, sendPRNotification, sendIssueNotification } = require('../services/discordService');

const getGithubPayload = (req) => {
    if (!req.body) return {};

    // GitHub can send JSON directly or form-encoded payload=<json>.
    if (typeof req.body.payload === 'string') {
        try {
            return JSON.parse(req.body.payload);
        } catch (error) {
            console.error('Invalid GitHub form payload JSON:', error.message);
            return {};
        }
    }

    return req.body;
};

const handleWebhook = async (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = getGithubPayload(req);
    const action = payload && payload.action ? payload.action : 'n/a';
    console.log(`Webhook received: ${event} (${action})`);

    if (!payload || Object.keys(payload).length === 0) {
        console.error("Error: empty payload. Ensure GitHub webhook content type is 'application/json'.");
        return res.status(400).send('Empty body');
    }

    if (event === 'ping') {
        return res.status(200).send('Pong!');
    }

    if (event === 'push') {
        const repoName = payload.repository.name;
        const pusherName = payload.pusher.name;
        const commits = payload.commits;
        const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : 'unknown';
        const avatarUrl = payload.sender ? payload.sender.avatar_url : '';

        if (commits && commits.length > 0) {
            console.log(`Received push event for ${repoName} by ${pusherName}`);

            for (const commit of commits) {
                const message = commit.message;
                const url = commit.url;
                const timestamp = commit.timestamp;
                const authorForThisCommit = commit.author.name;
                const commitHash = commit.id;

                const summary = await summarizeCommit(message, null);

                await sendCommitNotification(
                    repoName,
                    branch,
                    pusherName,
                    authorForThisCommit,
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
        const prAction = payload.action;
        const pr = payload.pull_request;
        const repoName = payload.repository.name;

        if (['opened', 'closed', 'reopened'].includes(prAction)) {
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
                prAction,
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
        const issueAction = payload.action;
        const issue = payload.issue;
        const repoName = payload.repository ? payload.repository.name : 'Unknown Repository';

        console.log(`Received issue event: ${issueAction} for ${repoName}`);

        if (!issue) {
            console.error('Error: payload missing issue object.');
            return res.status(200).send('Invalid payload');
        }

        if (['opened', 'closed', 'reopened'].includes(issueAction)) {
            const authorName = issue.user ? issue.user.login : 'Unknown';
            const authorAvatar = issue.user ? issue.user.avatar_url : '';
            const issueTitle = issue.title;
            const issueUrl = issue.html_url;
            const issueBody = issue.body || '';
            const timestamp = issue.updated_at || issue.created_at;

            const sent = await sendIssueNotification(
                repoName,
                issueAction,
                issueTitle || 'No Title',
                issueUrl,
                issueBody,
                authorName,
                authorAvatar,
                timestamp
            );

            if (!sent) {
                console.error('Failed to send issue notification to Discord. Check discordService logs.');
            }
        } else {
            console.log(`Ignoring issue action: ${issueAction}`);
        }
        return res.status(200).send('Issue Event processed');
    }

    return res.status(200).send('Event received');
};

module.exports = { handleWebhook };
