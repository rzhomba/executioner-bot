const dotenv = require('dotenv');

const config = dotenv.config();

if (config.error) {
    throw config.error;
}

module.exports = {
    token: config.parsed.TOKEN,
    clientId: config.parsed.CLIENT_ID,
    guildId: config.parsed.GUILD_ID,
    roleId: config.parsed.ROLE_ID,
};