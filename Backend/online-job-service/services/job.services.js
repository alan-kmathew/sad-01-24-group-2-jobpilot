const { default: axios } = require('axios');
const { logger } = require('../middleware/logging');
const { JobApplicationModel } = require('../db/model/schema');
const { getFilteredEmailMessages } = require('../middleware/helpers');

const saveJobApplications = async jobApplicationsData => {
    try {
        await JobApplicationModel.insertMany(jobApplicationsData);
        logger.info(`Job applications saved successfully`);
    } catch (err) {
        logger.error('Error while saving job applications: ', err);
    }
};

const getJobApplications = async email => {
    try {
        const jobApplications = await JobApplicationModel.aggregate([
            {
                $match: {
                    email: email,
                },
            },
            {
                $sort: {
                    company: 1,
                    position: 1,
                    date: -1,
                },
            },
            {
                $group: {
                    _id: {
                        company: '$company',
                        position: '$position',
                    },
                    latestApplication: { $first: '$$ROOT' },
                },
            },
            {
                $replaceRoot: { newRoot: '$latestApplication' },
            },
            {
                $project: {
                    _id: 0,
                    __v: 0,
                },
            },
        ]);

        logger.info(`Applications retrieved successfully`);
        return jobApplications;
    } catch (err) {
        logger.error(`Error while getting job applications from database: ${err}`);
    }
};

const getIdsFromApplications = async email => {
    try {
        const arrayOfIds = [];
        const messageIds = await JobApplicationModel.find({ email: email }).select('id -_id');
        messageIds.map(ids => {
            arrayOfIds.push(ids.id);
        });
        return arrayOfIds;
    } catch (err) {
        logger.error(`Error while getting job applications from database: ${err}`);
    }
};

const getJobApplicationDetails = async message => {
    try {
        const { data } = await axios.post(
            `${process.env.ONLINE_AI_SERVICE_URL}job/application/details`,
            {
                message,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return data;
    } catch (err) {
        logger.error(`Error while getting job applications details from ai-service: ${err} `);
    }
};
 

const refreshAccessToken = async (expiryDate, refreshToken) => {
    try {
        await axios.post(
            `${process.env.ONLINE_AUTH_SERVICE_URL}refresh/token`,
            {
                expiryDate,
                refreshToken,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (err) {
        logger.error(`Error while refreshing token: ${err}`);
    }
};

const getEmailIds = async (email, accessToken, emailQueryString) => {
    try {
        const emailIdList = await axios.get(
            `${process.env.GOOGLE_API_URL}${email}/messages?q=${emailQueryString}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return emailIdList.data;
    } catch (err) {
        logger.error(`Error while retrivig the email id list: ${err}`);
    }
};

const getEmailMessageLists = async (email, accessToken, messageId) => {
    try {
        const emailMessageList = await axios.get(
            `${process.env.GOOGLE_API_URL}${email}/messages/${messageId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        const emailMessage = emailMessageList.data;
        const messageData = await getFilteredEmailMessages(emailMessage);

        return {
            message: `id: ${emailMessage.id}, email:${email}, date: ${
                emailMessage.payload.headers.find(header => header.name === 'Date').value
            }, Subject: ${
                emailMessage.payload.headers.find(header => header.name === 'Subject').value +
                ` -- ` +
                messageData
            }`,
        };
    } catch (err) {
        logger.error(`Error while retrivig the email message list: ${err}`);
    }
};

const getEmailMessages = async (email, accessToken, expiryDate, refreshToken, emailQueryString) => {
    try {
        await refreshAccessToken(expiryDate, refreshToken);
        const arrayOfIds = await getIdsFromApplications(email);
        const emailIdList = await getEmailIds(email, accessToken, emailQueryString);
        const filteredEmailIdList = await emailIdList.messages.filter(
            msg => !arrayOfIds.includes(msg.id)
        );
        const messageObjects = await Promise.all(
            filteredEmailIdList.map(async emailIds =>
                getEmailMessageLists(email, accessToken, emailIds.id)
            )
        );

        return messageObjects;
    } catch (err) {
        logger.error(`Error while retrivig the email messages: ${err}`);
    }
};

const buildJobApplicationDetails = async (
    email,
    accessToken,
    expiryDate,
    refreshToken,
    emailQueryString
) => {
    const RATE_LIMIT_THRESHOLD = 65;
    const RATE_LIMIT_DELAY = 60 * 1000;

    try {
        const messageObjects = await getEmailMessages(
            email,
            accessToken,
            expiryDate,
            refreshToken,
            emailQueryString
        );

        let jobApplicationData = [];
        let requestCounter = 0;

        for (const messageObject of messageObjects) {
            if (requestCounter >= RATE_LIMIT_THRESHOLD) {
                logger.info(
                    `API Request limit reached for online-ai-service. Waiting for ${
                        RATE_LIMIT_DELAY / 1000
                    } seconds...`
                );
                await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
                requestCounter = 0;
            }

            const jobApplication = await getJobApplicationDetails(messageObject.message);
            logger.info(`ai api completed ${requestCounter}`);
            jobApplicationData.push(jobApplication);
            requestCounter++;
        }
    
        await saveJobApplications(jobApplicationData);
        const jobApplicationStatusData = await getJobApplications(email);
        return jobApplicationStatusData;
    } catch (err) {
        logger.error(`Error while building job application details: ${err}`);
    }
};

module.exports = {
    refreshAccessToken,
    getIdsFromApplications,
    getEmailIds,
    getEmailMessages,
    buildJobApplicationDetails,
    getEmailMessageLists,
};
