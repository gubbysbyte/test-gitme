require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Discord Client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);

// Middleware to parse JSON payloads
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('GitMe Bot Server is running!');
});

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

async function summarizeCommit(commitMessage, diff) {
    const prompt = `
    You are an expert developer explaining technical changes to a non-technical audience.
    Explain the following git commit in simple, layman terms.
    Focus on "what changed" and "why it matters" rather than the code details.
    Keep it concise (1-2 sentences).

    Commit Message: ${commitMessage}
    
    (Note: Diff details would go here if available, but relying on message for now)
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating summary:", error);
        return "Could not generate summary.";
    }
}

app.post('/webhook', async (req, res) => {
    try {
        const payload = req.body;

        // Basic validation for GitHub push events
        if (!payload.repository || !payload.commits) {
            return res.status(400).send('Invalid payload');
        }

        const repoName = payload.repository.name;
        const repoUrl = payload.repository.html_url;
        const committerName = payload.pusher.name;
        const commits = payload.commits;

        console.log(`Received push event for ${repoName} by ${committerName}`);

        // Process each commit (or just the latest one if there are many)
        for (const commit of commits) {
            const message = commit.message;
            const url = commit.url;
            const timestamp = commit.timestamp;

            // Generate Summary
            const summary = await summarizeCommit(message);

            // Create Discord Embed
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`New Commit in ${repoName}`)
                .setURL(url)
                .setAuthor({ name: committerName })
                .setDescription(`**AI Summary:**\n${summary}`)
                .addFields(
                    { name: 'Commit Message', value: message },
                    { name: 'Time', value: new Date(timestamp).toLocaleString() }
                )
                .setFooter({ text: 'GitMe Bot • Powered by Gemini' })
                .setTimestamp();

            // Send to Channel
            const channelId = process.env.DISCORD_CHANNEL_ID;
            if (channelId) {
                const channel = await client.channels.fetch(channelId);
                if (channel) {
                    await channel.send({ embeds: [embed] });
                    console.log('Notification sent to Discord');
                } else {
                    console.error('Channel not found');
                }
            } else {
                console.error('DISCORD_CHANNEL_ID not set');
            }
        }

        res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});