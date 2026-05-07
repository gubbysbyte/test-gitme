const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config/env');
const { initDiscord } = require('./services/discordService');
const { handleWebhook } = require('./controllers/webhookController');
const { verifySignature } = require('./middleware/verifySignature');

const app = express();

const captureRawBody = (req, res, buf) => { req.rawBody = buf; };

// Middleware
app.use(bodyParser.json({ verify: captureRawBody }));
app.use(bodyParser.urlencoded({ extended: true, verify: captureRawBody }));

// Routes
app.get('/', (req, res) => {
    res.send('GitMe Bot Server is running (Refactored)!');
});

app.post('/webhook', verifySignature, handleWebhook);

// Start Server
const startServer = async () => {
    // Start Express first so hosting platforms can detect a bound port quickly.
    app.listen(config.PORT, () => {
        console.log(`Server is running on port ${config.PORT}`);
    });

    // Connect to Discord in background.
    await initDiscord();
};

startServer();
