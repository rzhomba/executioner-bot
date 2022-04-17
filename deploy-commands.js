const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, clientId, guildId } = require('./modules/env.js');

const commands = [
    new SlashCommandBuilder()
        .setName('execution')
        .setDescription('Controls user executions.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Punishes the specified user.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stops punishment of the specified user.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stopall')
                .setDescription('Stops punishment of all users.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Displays list of the users that are under the punishment.')
        ),
]
    .map(command => command.toJSON());

console.log(commands);

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);