# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-21

### Added
- Discord bot with GitHub webhook integration
- AI-powered commit summaries using Google Gemini 2.5 Flash
- Push event notifications with AI analysis
- Pull Request notifications (Opened, Closed, Reopened, Merged)
- Issue notifications (Opened, Closed, Reopened)
- Color-coded Discord embeds (Green for features, Red for fixes, Purple for merges)
- Auto-retry logic for API rate limits (429 errors)
- Modular architecture with separate config, services, and controllers
- Environment variable configuration via `.env`
- Render.com deployment support with UptimeRobot keep-alive
