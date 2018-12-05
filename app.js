// Configurations to .ENV
require('dotenv').config();

const bot = require('./src/initBot');
bot.initializeBot();