const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = process.env.loggerLevel;

module.exports = {logger};
