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
    const msg = message.toLowerCase();
    if (msg.startsWith('fix') || msg.includes('bug')) return 0xE74C3C; // Red
    if (msg.startsWith('feat') || msg.startsWith('add')) return 0x2ECC71; // Green
    if (msg.startsWith('chore') || msg.startsWith('refactor')) return 0xF1C40F; // Yellow
    return 0x0099FF; // Default Blue
};

const getPRColor = (action, merged) => {
    if (merged) return 0x6f42c1; // Purple (Merged)
    if (action === 'opened' || action === 'reopened') return 0x2ECC71; // Green
    if (action === 'closed') return 0xE74C3C; // Red
    return 0x0099FF; // Blue
};

const getIssueColor = (action) => {
    if (action === 'opened' || action === 'reopened') return 0x2ECC71; // Green
    if (action === 'closed') return 0xE74C3C; // Red
    return 0xE67E22; // Orange
};

const sendCommitNotification = async (repoName, branch, committerName, message, url, summary, timestamp, commitHash, avatarUrl) => {
    try {
        const channel = await client.channels.fetch(config.DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error("Channel not found!");
            return false;
        }

        const embed = new EmbedBuilder()
            .setColor(getEmbedColor(message))
            .setTitle(`Repository: ${repoName}`)
            .setURL(url)
            .setAuthor({ name: committerName, iconURL: avatarUrl })
            .setThumbnail(avatarUrl)
            .setDescription(`**Summary:**\n${summary}`)
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
            .setDescription(`**Status:** ${statusText}\n\n${prBody ? (prBody.length > 500 ? prBody.substring(0, 497) + '...' : prBody) : 'No description provided.'}`)
            .addFields(
                { name: 'Repository', value: repoName, inline: true },
                { name: 'From Branch', value: headBranch, inline: true },
                { name: 'To Branch', value: baseBranch, inline: true }
            )
            .setFooter({ text: 'GitMe • Pull Request' })
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

        const embed = new EmbedBuilder()
            .setColor(getIssueColor(action))
            .setTitle(`Issue: ${issueTitle.length > 240 ? issueTitle.substring(0, 237) + '...' : issueTitle}`)
            .setURL(issueUrl)
            .setAuthor({ name: authorName, iconURL: authorAvatar || undefined })
            .setThumbnail(authorAvatar || null)
            .setDescription(`**Status:** ${statusText}\n\n${issueBody ? (issueBody.length > 500 ? issueBody.substring(0, 497) + '...' : issueBody) : 'No description provided.'}`)
            .addFields(
                { name: 'Repository', value: repoName, inline: true }
            )
            .setFooter({ text: 'GitMe • Issue' })
            .setTimestamp(new Date(timestamp));

        await channel.send({ embeds: [embed] });
        return true;
    } catch (error) {
        console.error("Error sending Issue message to Discord:", error);
        return false;
    }
};

module.exports = { initDiscord, sendCommitNotification, sendPRNotification, sendIssueNotification, client };
