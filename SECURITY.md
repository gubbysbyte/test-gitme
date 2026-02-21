# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in GitMe, please report it responsibly.

**⚠️ Do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

1. **Email**: Send a detailed report to the maintainer via GitHub ([@gubbysbyte](https://github.com/gubbysbyte))
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Status Update**: Within 7 days with an assessment
- **Fix Timeline**: Critical issues will be patched as soon as possible

### Scope

The following are in scope for security reports:

- API token/key exposure
- Webhook payload injection
- Discord bot permission escalation
- Dependencies with known vulnerabilities

### Best Practices for Users

- **Never** commit your `.env` file to version control
- Rotate your Discord bot token and Gemini API key periodically
- Use environment variables on your hosting platform instead of files
- Keep dependencies up to date with `npm audit`

## Thank You

We appreciate your help in keeping GitMe and its users safe! 🔒
