const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./modules/env.js');
const { logger } = require('./modules/logging');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
});

client.once('ready', () => {
    logger.info('Ready!');
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        logger.error(error);
        await interaction.reply({ content: 'An error has occurred while executing this command.', ephemeral: true });
    }
});

client.login(token)
    .then(() => logger.info('Logged in successfully!'));