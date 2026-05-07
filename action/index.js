const core = require('@actions/core');
const github = require('@actions/github');

async function sendToDiscord(webhookUrl, embed) {
    const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
    });
    if (!res.ok) {
        throw new Error(`Discord responded with ${res.status}: ${await res.text()}`);
    }
}

function buildPushEmbed(payload) {
    const repo = payload.repository.full_name;
    const branch = payload.ref.replace('refs/heads/', '');
    const commits = (payload.commits || []).slice(0, 5);

    const description = commits.map(c => {
        const hash = c.id.substring(0, 7);
        const msg = c.message.split('\n')[0].substring(0, 72);
        return `[\`${hash}\`](${c.url}) ${msg}`;
    }).join('\n') || 'No commits';

    return {
        title: `Push to \`${branch}\``,
        url: `https://github.com/${repo}/commits/${branch}`,
        color: 0x28a745,
        description,
        author: { name: payload.pusher.name },
        footer: { text: repo },
        timestamp: new Date().toISOString()
    };
}

function buildPREmbed(payload) {
    const pr = payload.pull_request;
    const action = payload.action;
    const repo = payload.repository.full_name;

    let color = 0x0075ca;
    if (action === 'closed' && pr.merged) color = 0x6f42c1;
    else if (action === 'closed') color = 0xcb2431;

    const actionLabel = action === 'closed' && pr.merged ? 'merged' : action;

    return {
        title: `PR ${actionLabel}: ${pr.title}`,
        url: pr.html_url,
        color,
        description: (pr.body || '').substring(0, 300) || null,
        author: { name: pr.user.login, icon_url: pr.user.avatar_url },
        fields: [{ name: 'Branch', value: `\`${pr.head.ref}\` → \`${pr.base.ref}\``, inline: true }],
        footer: { text: repo },
        timestamp: pr.updated_at
    };
}

function buildIssueEmbed(payload) {
    const issue = payload.issue;
    const action = payload.action;
    const repo = payload.repository.full_name;

    return {
        title: `Issue ${action}: ${issue.title}`,
        url: issue.html_url,
        color: action === 'closed' ? 0xcb2431 : 0x28a745,
        description: (issue.body || '').substring(0, 300) || null,
        author: { name: issue.user.login, icon_url: issue.user.avatar_url },
        footer: { text: repo },
        timestamp: issue.updated_at
    };
}

async function run() {
    try {
        const webhookUrl = core.getInput('discord-webhook-url', { required: true });
        const { eventName, payload } = github.context;

        core.info(`Processing event: ${eventName}`);

        let embed;

        if (eventName === 'push') {
            embed = buildPushEmbed(payload);
        } else if (eventName === 'pull_request') {
            if (!['opened', 'closed', 'reopened'].includes(payload.action)) {
                core.info(`Skipping pull_request action: ${payload.action}`);
                return;
            }
            embed = buildPREmbed(payload);
        } else if (eventName === 'issues') {
            if (!['opened', 'closed', 'reopened'].includes(payload.action)) {
                core.info(`Skipping issues action: ${payload.action}`);
                return;
            }
            embed = buildIssueEmbed(payload);
        } else {
            core.info(`Unsupported event: ${eventName}`);
            return;
        }

        await sendToDiscord(webhookUrl, embed);
        core.info('Discord notification sent');
    } catch (err) {
        core.setFailed(err.message);
    }
}

run();
