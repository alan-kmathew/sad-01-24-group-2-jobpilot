const mongoose = require('mongoose');
const { logger } = require('../../middleware/logging');

const connectDB = async () => {
    try {
        await mongoose.connect(
            'mongodb+srv://' +
                process.env.MONGODB_USERNAME +
                ':' +
                process.env.MONGODB_PASSWORD +
                '@' +
                process.env.MONGODB_CLUSTER_URL,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                dbName: process.env.MONGODB_DATABASE,
            }
        );
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = { connectDB };
