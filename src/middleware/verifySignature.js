const crypto = require('crypto');
const { GITHUB_WEBHOOK_SECRET } = require('../config/env');

const verifySignature = (req, res, next) => {
    if (!GITHUB_WEBHOOK_SECRET) {
        return next();
    }

    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
        return res.status(401).send('Missing X-Hub-Signature-256 header');
    }

    if (!req.rawBody) {
        return res.status(500).send('Raw body unavailable for signature verification');
    }

    const digest = 'sha256=' + crypto
        .createHmac('sha256', GITHUB_WEBHOOK_SECRET)
        .update(req.rawBody)
        .digest('hex');

    // Pad to equal length before comparing to avoid length-leak timing attacks
    const sigBuf = Buffer.from(signature.padEnd(digest.length, '0'));
    const digestBuf = Buffer.from(digest.padEnd(signature.length, '0'));

    if (sigBuf.length !== digestBuf.length || !crypto.timingSafeEqual(sigBuf, digestBuf)) {
        console.warn('Webhook signature mismatch — request rejected');
        return res.status(401).send('Invalid signature');
    }

    next();
};

module.exports = { verifySignature };