const dotenv = require('dotenv');

let env;

if (process.env.NODE_ENV === 'production') {
    env = process.env;
} else {
    const config = dotenv.config();
    if (config.error) {
        throw config.error;
    }
    env = config.parsed;
}

module.exports = {
    token: env.TOKEN,
    clientId: env.CLIENT_ID,
    guildId: env.GUILD_ID,
    roleId: env.ROLE_ID,
};
