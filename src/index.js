const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config/env');
const { initDiscord } = require('./services/discordService');
const { handleWebhook } = require('./controllers/webhookController');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
    res.send('GitMe Bot Server is running (Refactored)!');
});

app.post('/webhook', handleWebhook);

// Start Server
const startServer = async () => {
    // 1. Connect to Discord first
    await initDiscord();

    // 2. Start Express
    app.listen(config.PORT, () => {
        console.log(`Server is running on port ${config.PORT}`);
    });
};

startServer();
