# Contributing to GitMe 🤝

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to GitMe. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Style Guide](#style-guide)
- [Commit Messages](#commit-messages)

## Code of Conduct

This project and everyone participating in it is governed by the [GitMe Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### 🐛 Reporting Bugs

- Use the [Bug Report](https://github.com/gubbysbyte/gitme/issues/new?template=bug_report.md) template.
- Include steps to reproduce the issue.
- Include your Node.js version, OS, and any relevant logs.

### 💡 Suggesting Features

- Use the [Feature Request](https://github.com/gubbysbyte/gitme/issues/new?template=feature_request.md) template.
- Describe the problem your feature would solve.
- Explain your proposed solution.

### 🔧 Pull Requests

1. Fork the repo and create your branch from `main`.
2. Make your changes.
3. Test your changes locally.
4. Submit a pull request with a clear description.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A Discord Bot Token ([how to get one](https://discord.com/developers/applications))
- A Gemini API Key ([how to get one](https://aistudio.google.com/app/apikey))
- [Ngrok](https://ngrok.com/) (for local webhook testing)

### Setup

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/gitme.git
cd gitme

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your keys

# 4. Start the development server
npm run dev
```

## Development Workflow

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. Make your changes in the `src/` directory:
   ```
   src/
   ├── config/       # Environment & configuration
   ├── controllers/  # Request handlers (webhook logic)
   ├── services/     # Business logic (Discord, Gemini)
   └── index.js      # App entry point
   ```

3. Test locally by running the bot and sending test webhooks:
   ```bash
   npm run dev
   # In another terminal:
   node tests/test-manual-events.js push
   ```

4. Push your branch and open a PR.

## Style Guide

- **Runtime**: Node.js with CommonJS (`require`/`module.exports`)
- **Formatting**: Use 4-space indentation
- **Naming**: Use `camelCase` for variables/functions, `PascalCase` for classes
- **Strings**: Use single quotes for strings, template literals for interpolation
- **Comments**: Add comments for complex logic, not obvious code
- **Error Handling**: Always handle promise rejections and add meaningful error messages

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <description>

[optional body]
```

**Types:**
| Type | Description |
|:---|:---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `refactor` | Code refactoring (no feature/fix) |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

**Examples:**
```
feat: add support for GitHub release events
fix: handle empty commit messages gracefully
docs: update setup instructions for Windows
```

---

Thank you for contributing! 💜
