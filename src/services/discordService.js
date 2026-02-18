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

module.exports = { initDiscord, sendCommitNotification, client };
