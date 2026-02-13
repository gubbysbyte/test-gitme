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

const sendCommitNotification = async (repoName, committerName, message, url, summary, timestamp) => {
    try {
        const channel = await client.channels.fetch(config.DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error("Channel not found!");
            return false;
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`New Commit in "${repoName}" Repository`)
            .setURL(url)
            .setAuthor({ name: committerName })
            .setDescription(`**Summary:**\n${summary}`)
            .addFields(
                { name: 'Commit Message', value: message },
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
