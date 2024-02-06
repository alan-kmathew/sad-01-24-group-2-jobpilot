const { Router } = require('express');
const { validationResult, body, query } = require('express-validator');
const { logger } = require('../middleware/logging');
const {
    saveRegisteredUsers,
    checkUserExists,
    checkIsValidPassword,
} = require('../services/auth.services');
const { generateJwtToken } = require('../middleware/jwt.auth');
const { createOAuth2Client } = require('../middleware/google.auth');
const { default: axios } = require('axios');

const router = new Router();

let oAuth2Client;

(async () => {
    try {
        oAuth2Client = await createOAuth2Client();
    } catch (err) {
        logger.error('Error initializing OAuth2Client:', err);
        process.exit(1);
    }
})();

const validateRegisterRequiredFields = [
    body('user.firstname').notEmpty().withMessage('First name is required.'),
    body('user.lastname').notEmpty().withMessage('Last name is required.'),
    body('user.email').notEmpty().isEmail().withMessage('Valid email is required.'),
    body('user.password').notEmpty().withMessage('Password is required.'),
];

const validateLoginRequiredFields = [
    body('email').notEmpty().isEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
];

const validateRefreshTokenFields = [
    body('expiryDate').notEmpty().withMessage('Token expiry date is required.'),
    body('refreshToken').notEmpty().withMessage('Refresh Token is required.'),
];

router.post('/register', validateRegisterRequiredFields, async (req, res) => {
    try {
        logger.info(`Entering ${req.baseUrl}${req.path}`);
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const erroMessage = validationErrors.array();
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: erroMessage,
                path: `${req.baseUrl}${req.path}`,
            });
        }
        const isUserExists = await checkUserExists(req.body.user.email);
        if (isUserExists) {
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: `User with email ${req.body.user.email} already exists`,
                path: `${req.baseUrl}${req.path}`,
            });
        } else {
            const addedUsers = await saveRegisteredUsers(req.body.user);
            if (addedUsers) {
                res.status(201).json({
                    message: 'User Registered successfully',
                    username: `${addedUsers.user.firstname} ${addedUsers.user.lastname}`,
                });
            }
        }
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

router.post('/login', validateLoginRequiredFields, async (req, res) => {
    try {
        logger.info(`Entering ${req.baseUrl}${req.path}`);
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const erroMessage = validationErrors.array();
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: erroMessage,
                path: `${req.baseUrl}${req.path}`,
            });
        }
        const isValid = await checkIsValidPassword(req.body.email, req.body.password);
        if (!isValid) {
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: 'Invalid Credientials',
                path: `${req.baseUrl}${req.path}`,
            });
        } else {
            const token = await generateJwtToken(req.body.email);
            res.status(200).json({
                token,
            });
        }
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

router.get('/google', async (req, res) => {
    try {
        const authUrl = await oAuth2Client.generateAuthUrl({
            scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
            access_type: 'offline',
            prompt: 'consent',
        });
        res.redirect(authUrl);
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        const { tokens } = await oAuth2Client.getToken(code);
        const userInfo = await axios.get(process.env.GOOGLE_USER_INFO_URL, {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                'Content-Type': 'application/json',
            },
        });
        const isUserExists = await checkUserExists(userInfo.data.email);
        if (!isUserExists) {
            const userData = {
                firstname: userInfo.data.given_name,
                lastname: userInfo.data.family_name,
                email: userInfo.data.email,
                googleId: userInfo.data.id,
            };
            await saveRegisteredUsers(userData);
        }
        res.cookie('access_token', tokens.access_token);
        res.cookie('refresh_token', tokens.refresh_token);
        res.cookie('expiry_date', tokens.expiry_date);
        res.cookie('email', userInfo.data.email);
        res.cookie('profile_picture', userInfo.data.picture);
        res.cookie('firstname', userInfo.data.given_name);
        res.cookie('lastname', userInfo.data.family_name);
        res.redirect('http://localhost:3000/dashboard');
        logger.info('Authentication successful!');
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

router.post('/refresh/token', validateRefreshTokenFields, async (req, res) => {
    try {
        if (req.body.expiryDate <= Date.now()) {
            oAuth2Client.setCredentials({
                refresh_token: req.body.refreshToken,
            });
            logger.warn('Access Token Expired');
            const { tokens } = await oAuth2Client.refreshToken(req.body.refreshToken);
            res.cookie('access_token', tokens.access_token);
            res.cookie('expiry_date', tokens.expiry_date);
            res.cookie('refresh_token', tokens.refresh_token);
            res.send('Access Token refreshed');
        } else {
            res.send('Access Token is valid');
        }
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

module.exports = router;
