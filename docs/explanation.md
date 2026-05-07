# GitMe — How It Works

This document explains the full picture of GitMe: what it does, the two ways it can run, and what each piece of code is responsible for.

---

## What GitMe Does

GitMe watches your GitHub repositories and sends formatted notifications to a Discord channel whenever something happens — a commit is pushed, a pull request is opened or merged, or an issue is filed.

For commit pushes, it also passes the commit message through a local AI model (via LM Studio) to generate a plain-English summary of the change.

---

## Two Ways to Run GitMe

GitMe can operate in two completely different modes. You pick whichever fits your setup.

### Mode 1 — Webhook Server

You run a Node.js server somewhere (locally with ngrok, or hosted on Render). GitHub sends HTTP POST requests to your server every time an event happens. Your server processes them and posts to Discord using a bot.

```
Developer pushes code
    → GitHub sends POST /webhook to your server
        → Server parses the payload
        → AI summarizes the commit (optional)
        → Discord bot posts an embed to your channel
```

**What you need:**
- A server to host the bot (Render, VPS, local + ngrok)
- A Discord bot token and channel ID
- LM Studio running locally (optional, for AI summaries)
- `GITHUB_WEBHOOK_SECRET` set for security

**Best for:** Power users who want AI summaries and full control.

---

### Mode 2 — GitHub Action

No server needed. A small script runs directly inside GitHub's CI pipeline every time an event fires. It reads the event data from the GitHub Actions environment and posts to Discord via a webhook URL.

```
Developer pushes code
    → GitHub triggers the workflow automatically
        → dist/index.js runs inside GitHub's servers
        → Discord receives the embed via webhook URL
```

**What you need:**
- A Discord webhook URL (created in Discord server settings)
- Add one YAML file to your repo
- Add `DISCORD_WEBHOOK_URL` as a GitHub secret

**Best for:** Anyone who wants zero-infrastructure notifications in under 5 minutes.

---

## Feature Comparison

| Feature | Webhook Server | GitHub Action |
|---|---|---|
| Runs on | Your server | GitHub's servers |
| Hosting required | Yes | No |
| AI commit summaries | Yes (LM Studio + Gemma) | No |
| Discord auth method | Bot token | Webhook URL |
| Setup time | ~30 minutes | ~5 minutes |
| Works on other repos | Requires webhook config per repo | Copy one YAML file |

---

## Webhook Signature Verification

GitHub signs every webhook request with an HMAC-SHA256 hash of the request body, using a secret you define. GitMe validates this signature before processing any payload, so fake or tampered requests are rejected with a `401`.

**How it works:**

1. You set a secret in GitHub (repo → Settings → Webhooks) and add the same value as `GITHUB_WEBHOOK_SECRET` in your `.env`.
2. When GitHub sends a webhook, it includes an `X-Hub-Signature-256` header like: `sha256=abc123...`
3. GitMe computes its own HMAC of the raw request body using your secret.
4. It compares the two using `crypto.timingSafeEqual` (prevents timing attacks).
5. If they don't match → `401 Invalid signature`. If they match → the request proceeds.

If `GITHUB_WEBHOOK_SECRET` is not set, verification is skipped with a warning. This lets you get started quickly, but you should always set it in production.

---

## Code Architecture

### Webhook Server (`src/`)

```
src/
├── index.js                  Entry point. Starts Express, registers middleware and routes, connects Discord bot.
├── config/
│   └── env.js                Loads .env, validates required vars, exposes config to the rest of the app.
├── middleware/
│   └── verifySignature.js    Validates X-Hub-Signature-256 before the request reaches the controller.
├── controllers/
│   └── webhookController.js  Parses GitHub payloads, routes by event type, calls services.
└── services/
    ├── aiService.js          Sends commit message to LM Studio and returns a plain-English summary.
    └── discordService.js     Builds Discord embeds and sends them via the bot.
```

### GitHub Action (`action/`)

```
action/
└── index.js    Reads GitHub event context, builds the same embeds as the server, POSTs to Discord webhook URL.

dist/
└── index.js    Bundled version of the above (built with `npm run build:action`). This is what GitHub executes.

action.yml      Declares the Action: its name, inputs, and that it runs dist/index.js on Node 20.
```

### Event Fixture Files (`tests/events/`)

Used with `act` for local Action testing. Each file is a realistic GitHub event payload:

```
tests/events/
├── push.json          Simulates a commit push
├── pull_request.json  Simulates a PR being opened
└── issue.json         Simulates an issue being filed
```

---

## How the GitHub Action is Published

The action lives at the root of this repo (`action.yml`). When another repo references `gubbysbyte/gitme@main` in a workflow, GitHub fetches that `action.yml` and runs `dist/index.js`.

This means:
- Whenever you change `action/index.js`, you must run `npm run build:action` and commit the updated `dist/index.js`.
- The `dist/` folder is intentionally **not** in `.gitignore` for this reason.

---

## Embed Colors

Both modes use the same color scheme:

| Event | Condition | Color |
|---|---|---|
| Push | Always | Green |
| Pull Request | Opened / Reopened | Blue |
| Pull Request | Merged | Purple |
| Pull Request | Closed (not merged) | Red |
| Issue | Opened / Reopened | Green |
| Issue | Closed | Red |

---

## Environment Variables

| Variable | Required for | Purpose |
|---|---|---|
| `DISCORD_TOKEN` | Webhook Server | Bot authentication |
| `DISCORD_CHANNEL_ID` | Webhook Server | Where to post notifications |
| `GITHUB_WEBHOOK_SECRET` | Webhook Server | Validates incoming webhook requests |
| `LM_STUDIO_BASE_URL` | Webhook Server (optional) | Local AI endpoint |
| `LM_STUDIO_MODEL` | Webhook Server (optional) | Model to use in LM Studio |
| `PORT` | Webhook Server (optional) | Express listen port, defaults to 3000 |
| `DISCORD_WEBHOOK_URL` | GitHub Action | Discord webhook URL (set as GitHub secret) |
