const { OAuth2Client } = require('google-auth-library');
const { logger } = require('../middleware/logging');

const createOAuth2Client = async () => {
    try {
        const oAuth2Client = new OAuth2Client({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri: process.env.GOOGLE_CALLBACK_URL,
        });
        return oAuth2Client;
    } catch (err) {
        logger.error(`Error while initializing OAuth2Client: ${err} `);
    }
};

module.exports = { createOAuth2Client };
