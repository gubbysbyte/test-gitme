const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('../config/env');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Initialize and login
const initDiscord = async () => {
    try {
        await client.login(config.DISCORD_TOKEN);
        console.log(`Logged in as ${client.user.tag}!`);
    } catch (error) {
        console.error("Discord Login Error:", error);
    }
};

const getEmbedColor = (message) => {
    return 0x2ECC71; // Green
};

const getPRColor = (action, merged) => {
    if (merged) return 0x6f42c1; // Purple (Merged)
    if (action === 'opened' || action === 'reopened') return 0x0099FF; // Blue
    if (action === 'closed') return 0x0099FF; // Blue
    return 0x0099FF; // Blue
};

const getIssueColor = (action) => {
    if (action === 'opened' || action === 'reopened') return 0xE74C3C; // Red
    if (action === 'closed') return 0xE74C3C; // Red
    return 0xE67E22; // Orange
};

const sendPushNotification = async (repoName, branch, pusherName, commits, headSummary, avatarUrl) => {
    try {
        const channel = await client.channels.fetch(config.DISCORD_CHANNEL_ID);
        if(!channel) {
            console.error("Channel not found!");
            return false;
        }
        const headCommit = commits[commits.length - 1];
        const maxListed = 10;
        const commitLines = commits.slice(0, maxListed).map(commit => `- ${commit.message} (${commit.id.substring(0, 7)})`).join('\n');
        const extraCount = commits.length - maxListed;
        const commitList = commitLines + (extraCount > 0 ? `\n...and ${extraCount} more commits.` : '');

        const embed = new EmbedBuilder()
            .setColor(getEmbedColor())
            .setTitle(`Repository: ${repoName}`)
            .setURL(headCommit.url)
            .setAuthor({ name: pusherName, iconURL: avatarUrl })
            .setThumbnail(avatarUrl)
            .setDescription(`**Summary:**\n${headSummary}`)
            .addFields(
                { name: 'Branch', value: branch, inline: true },
                { name: 'Commits', value: `${commits.length}`, inline: true },
                { name: 'Commit List', value: commitList },
                { name: 'Date', value: new Date(headCommit.timestamp).toLocaleDateString() }
            )
            .setFooter({ text: 'GitMe' })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        return true;
    } catch (error){
        console.error("Error sending push notification to Discord:", error);
        return false;
    }
}

const sendCommitNotification = async (repoName, branch, pusherName, committerName, message, url, summary, timestamp, commitHash, avatarUrl) => {
    try {
        const channel = await client.channels.fetch(config.DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error("Channel not found!");
            return false;
        }

        let customDescription = `**Summary:**\n${summary}`;

        // Logic for dynamic names: If someone else pushes code to main, show a special message.
        if (branch === 'main' && pusherName !== committerName) {
            customDescription = `**This commit from ${committerName} has been pushed to the main branch**\n\n${customDescription}`;
        }

        const embed = new EmbedBuilder()
            .setColor(getEmbedColor(message))
            .setTitle(`Repository: ${repoName}`)
            .setURL(url)
            .setAuthor({ name: pusherName, iconURL: avatarUrl })
            .setThumbnail(avatarUrl)
            .setDescription(customDescription)
            .addFields(
                { name: 'Branch', value: branch, inline: true },
                { name: 'Hash', value: commitHash ? commitHash.substring(0, 7) : 'N/A', inline: true },
                { name: 'Commit Message', value: message.length > 1024 ? message.substring(0, 1021) + '...' : message },
                { name: 'Date', value: new Date(timestamp).toLocaleDateString() }
            )
            .setFooter({ text: 'GitMe' })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        return true;
    } catch (error) {
        console.error("Error sending message to Discord:", error);
        return false;
    }
};

const sendPRNotification = async (repoName, action, prTitle, prUrl, prBody, authorName, authorAvatar, baseBranch, headBranch, timestamp, isMerged) => {
    try {
        const channel = await client.channels.fetch(config.DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error("Channel not found!");
            return false;
        }

        let statusText = action.toUpperCase();
        if (isMerged) statusText = 'MERGED 🟣';
        else if (action === 'closed') statusText = 'CLOSED 🔴';
        else if (action === 'opened') statusText = 'OPENED 🟢';

        const embed = new EmbedBuilder()
            .setColor(getPRColor(action, isMerged))
            .setTitle(`PR: ${prTitle}`)
            .setURL(prUrl)
            .setAuthor({ name: authorName, iconURL: authorAvatar })
            .setThumbnail(authorAvatar)
            .setDescription(`**Status:** ${statusText}\n**Description:** \n${prBody ? (prBody.length > 500 ? prBody.substring(0, 497) + '...' : prBody) : 'No description provided.'}`)
            .addFields(
                { name: 'Repository', value: repoName, inline: true },
                { name: 'From Branch', value: headBranch, inline: true },
                { name: 'To Branch', value: baseBranch, inline: true }
            )
            .setFooter({ text: 'GitMe' })
            .setTimestamp(new Date(timestamp));

        await channel.send({ embeds: [embed] });
        return true;
    } catch (error) {
        console.error("Error sending PR message to Discord:", error);
        return false;
    }
};

const sendIssueNotification = async (repoName, action, issueTitle, issueUrl, issueBody, authorName, authorAvatar, timestamp) => {
    try {
        console.log(`Sending Issue Notification: ${action} - ${issueTitle}`);

        const channel = await client.channels.fetch(config.DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error("Channel not found!");
            return false;
        }

        let statusText = action.toUpperCase();
        if (action === 'opened') statusText = 'OPENED 🟢';
        else if (action === 'closed') statusText = 'CLOSED 🔴';
        else if (action === 'reopened') statusText = 'REOPENED 🔄';

        const safeAuthorAvatar = (authorAvatar && authorAvatar.startsWith('http')) ? authorAvatar : null;

        const embed = new EmbedBuilder()
            .setColor(getIssueColor(action))
            .setTitle(`Issue: ${issueTitle ? (issueTitle.length > 240 ? issueTitle.substring(0, 237) + '...' : issueTitle) : 'No Title'}`)
            .setAuthor({ name: authorName || 'Unknown', iconURL: safeAuthorAvatar || undefined })
            .setThumbnail(safeAuthorAvatar)
            .setDescription(`**Status:** ${statusText}\n\n${issueBody ? (issueBody.length > 500 ? issueBody.substring(0, 497) + '...' : issueBody) : 'No description provided.'}`)
            .addFields(
                { name: 'Repository', value: repoName || 'Unknown', inline: true }
            )
            .setFooter({ text: 'GitMe' })
            .setTimestamp(timestamp ? new Date(timestamp) : new Date());

        if (issueUrl && (issueUrl.startsWith('http') || issueUrl.startsWith('https'))) {
            embed.setURL(issueUrl);
        }

        await channel.send({ embeds: [embed] });
        return true;
    } catch (error) {
        console.error("Error sending Issue message to Discord:", error);
        return false;
    }
};

module.exports = { initDiscord, sendCommitNotification, sendPRNotification, sendIssueNotification, sendPushNotification, client };
