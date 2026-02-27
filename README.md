# GitMe - AI Git Summarizer Bot 🤖

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2.svg)](https://discord.js.org/)

GitMe is a Discord bot that watches your GitHub repositories. It tracks **Commits**, **Pull Requests**, and **Issues**, using **LM Studio (Gemma)** to:
1.  Analyze technical commit messages.
2.  Summarize changes into simple, layman terms locally.
3.  Post beautiful, color-coded notifications to your Discord channel.

## Features
*   🚀 **Lightweight**: Built with Node.js, Express, and Discord.js.
*   🧠 **AI-Powered**: Uses a local LLM via LM Studio to explain code changes without API costs.
*   🔔 **Event Tracking**:
    *   **Commits**: AI summaries, branch info, and commit hashes.
    *   **Pull Requests**: Notifications for Opened, Closed, Reopened, and Merged events.
    *   **Issues**: Notifications for Opened, Closed, and Reopened issues.
*   🎨 **Smart Embeds**:
    *   **Dynamic Colors**: Green for Features/Opens, Red for Fixes/Closures, Purple for Merges.
    *   **Rich Details**: Includes author avatars, branch names, and truncated messages for readability.
*   🛡️ **Error Handling**: Robust error handling for local API connection issues.
*   📂 **Modular Architecture**: Professional structure with separate services, controllers, and config.

## Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Ngrok](https://ngrok.com/) (to expose your local server to GitHub)
*   A Discord Account & Server
*   [LM Studio](https://lmstudio.ai/) (to run the local LLM)

---

## 🛠️ Step-by-Step Setup

### 1. Clone & Install
```bash
git clone https://github.com/gubbysbyte/gitme.git
cd gitme
npm install
```

### 2. Configure Environment Variables
1.  Rename `.env.example` to `.env`.
2.  Open `.env` and fill in your keys:

```env
DISCORD_TOKEN="your_bot_token_here"
DISCORD_CHANNEL_ID="your_channel_id_here"
LM_STUDIO_BASE_URL="http://localhost:1234/v1"
LM_STUDIO_MODEL="google/gemma-3-4b"
PORT=3000
```
*(Make sure to keep the quotes around the values!)*

#### Where to get the keys:
*   **DISCORD_TOKEN**: Go to [Discord Developer Portal](https://discord.com/developers/applications) -> New Application -> Bot -> Reset Token.
*   **DISCORD_CHANNEL_ID**: In Discord app, go to User Settings -> Advanced -> Enable Developer Mode. Then right-click your target channel -> Copy ID.
*   **LM_STUDIO_BASE_URL**: Usually `http://localhost:1234/v1` (Default port for LM Studio).
*   **LM_STUDIO_MODEL**: The identifier of the model loaded in LM Studio (e.g., `google/gemma-3-4b`).

### 3. Invite Bot to Server
1.  In Discord Developer Portal -> OAuth2 -> URL Generator.
2.  Select **Scopes**: `bot`.
3.  Select **Bot Permissions**: `View Channels`, `Send Messages`, `Embed Links`.
4.  Copy the generated URL, open it in a browser, and invite the bot to your server.

### 4. Start the Application
First, start your local server. This runs the bot and listens for webhooks.
```bash
npm start
```

### 5. Expose Local Server (Ngrok)
In a **new terminal window**, run ngrok to give your local server a public URL:
```bash
npx ngrok http 3000
```
Copy the **Forwarding URL** (e.g., `https://abcdef123.ngrok-free.app`).

> **⚠️ Important:** On the free ngrok plan, this URL changes every time you restart ngrok.

### 6. Configure GitHub Webhook
1.  Go to your GitHub Repository -> **Settings** -> **Webhooks**.
2.  Click **Add webhook**.
3.  **Payload URL**: Paste your ngrok URL and append `/webhook` at the end.
    *   Example: `https://abcdef123.ngrok-free.app/webhook`
4.  **Content type**: Select `application/json`.
5.  **Which events?**: Select **Let me select individual events** and check: **Pushes**, **Pull requests**, **Issues**.
6.  Click **Add webhook**.

---

## 🧪 Testing

1.  Make a change to a file in your repository.
2.  Commit and push:
    ```bash
    git add .
    git commit -m "feat: testing the new bot"
    git push
    ```
3.  Check your Discord channel! 
    *   You should see a message with "AI Summary".

### Manual Test Script
You can also simulate a webhook without pushing to GitHub:
```bash
node tests/test-manual-events.js push
node tests/test-manual-events.js issue
node tests/test-manual-events.js pr
```

### AI Summary Test
Test if your LM Studio integration is working correctly:
```bash
npm run test:gemma
```
*(Make sure LM Studio is running and the model is loaded!)*

---

## 🐛 Troubleshooting

| Error | Cause | Solution |
| :--- | :--- | :--- |
| **TokenInvalid** | Empty `.env` or bad token | Check `.env` file. Ensure values are in quotes `""`. |
| **Missing Access** | Bot not in channel/server | Invite bot to server. Give `View Channel` & `Send Message` permissions. |
| **ECONNREFUSED** | LM Studio server not running | Open LM Studio and ensure the Local Server is **Started**. |
| **Model Not Found** | Wrong model name in `.env` | Ensure `LM_STUDIO_MODEL` matches the identifier in LM Studio. |
| **Webhook 404** | Wrong URL in GitHub | Ensure Payload URL ends with `/webhook` (e.g., `...ngrok-free.app/webhook`). |

## ☁️ Deployment (Render + UptimeRobot)

Since Heroku is no longer free without a card, we use **Render.com**.
To prevent the bot from sleeping after 15 minutes, use **UptimeRobot**.

### Step 1: Deploy to Render
1.  Push this code to GitHub.
2.  Log in to [Render.com](https://render.com).
3.  **New +** -> **Web Service**.
4.  Connect your repo.
5.  **Build Command**: `npm install`
6.  **Start Command**: `npm start`
7.  **Environment Variables**: Add your keys (`DISCORD_TOKEN`, etc).
8.  Click **Create Web Service**.

### Step 2: Keep It Awake (Free 24/7)
1.  Copy your new Render URL (e.g., `https://gitme-bot.onrender.com`).
2.  Go to [UptimeRobot.com](https://uptimerobot.com) (Free account).
3.  **Add New Monitor**:
    *   **Type**: HTTP(s).
    *   **Friendly Name**: My GitMe Bot.
    *   **URL**: Paste your Render URL.
    *   **Monitoring Interval**: 5 minutes.
4.  Click **Create Monitor**.

### ⚠️ IMPORTANT: Update Webhook
Update your GitHub Webhook URL to:
`https://gitme-bot.onrender.com/webhook`

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

Please note that this project has a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.

## 🔒 Security

To report a security vulnerability, please see our [Security Policy](SECURITY.md).

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of notable changes.

## License

This project is licensed under the [MIT License](LICENSE).
