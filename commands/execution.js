const { SlashCommandBuilder } = require('@discordjs/builders');
const { Scheduler } = require('../modules/scheduler');
const { execution } = require('../config.json');
const { logger } = require('../modules/logging');
const { roleId } = require('../modules/env');

const intervals = [0];
let counter = 0, muted = false;
do {
    counter += muted ? execution.muteTimeout : execution.muteDuration;
    muted = !muted;

    intervals.push(counter * 1000);
} while (counter <= execution.totalDuration);

const scheduler = new Scheduler(intervals, async (data) => {
    const { user, muted } = data;
    if (user.voice.channel) {
        await user.voice.setMute(!muted);
    }

    data.muted = !muted;
}, async (data) => {
    const { user, manual } = data;
    if (user.voice.channel) {
        console.log(user.user.tag);
        await user.voice.setMute(false);
    }

    if (!manual) {
        logger.info(`Execution on user ${data.user.user.tag} ended.`);
    }
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('execution')
        .setDescription('Controls user executions.')
        .addSubcommand(subcommand => subcommand
            .setName('start')
            .setDescription('Starts the execution on specified user')
            .addUserOption(option => option.setName('target')
                .setDescription('The user')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('stop')
            .setDescription('Stops punishment of the specified user.')
            .addUserOption(option => option.setName('target')
                .setDescription('The user')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('stopall')
            .setDescription('Stops punishment of all users.'))
        .addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('Displays the list of users that are under the execution.')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const admin = interaction.guild.members.cache.get(interaction.user.id);

        if (roleId) {
            const hasRole = admin.roles.cache.has(roleId);

            if (!hasRole) {
                interaction.reply({ content: 'You don\'t have enough permissions to use this.', ephemeral: true });
                return;
            }
        }

        if (subcommand === 'start') {
            const target = interaction.guild.members.cache.get(interaction.options.getUser('target').id);

            if (!target.voice.channel) {
                interaction.reply({ content: 'This user isn\'t connected to any voice channel', ephemeral: true });
                return;
            }

            const check = scheduler.add(target.id, { user: target, muted: false, dateStarted: new Date() });
            if (!check) {
                interaction.reply({ content: 'This user is already under execution.', ephemeral: true });
                return;
            }

            logger.info(`Started execution on ${target.user.tag} by ${admin.user.tag}`);
            interaction.reply({ content: 'Started execution.' });
        } else if (subcommand === 'stop') {
            const target = interaction.guild.members.cache.get(interaction.options.getUser('target').id);

            const check = await scheduler.clear(target.id, { user: target, manual: true });
            if (!check) {
                interaction.reply({ content: 'This user isn\'t under execution.', ephemeral: true });
                return;
            }

            logger.info(`Stopped execution on ${target.user.tag} by ${target.user.tag}`);
            interaction.reply({ content: 'Stopped execution.' });
        } else if (subcommand === 'stopall') {
            const count = await scheduler.clearAll({ manual: true });
            if (count === 0) {
                interaction.reply({ content: 'There are no users under execution currently.', ephemeral: true });
                return;
            }

            logger.info(`Stopping execution on ${count} users by ${admin.user.tag}`);
            interaction.reply({ content: `Stopped execution on ${count} users.` });
        } else if (subcommand === 'list') {
            logger.info(`Execution list requested by ${admin.user.tag}`);

            const list = scheduler.targets;
            if (list.length === 0) {
                interaction.reply({ content: 'There are no users under execution.', ephemeral: true });
                return;
            }

            let counter = 1;
            let response = '';
            for (const elem of list) {
                const { user, dateStarted } = elem.data;
                const timeLeft = execution.totalDuration - (new Date() - dateStarted) / 1000;
                response += `${counter++}. ${user.toString()} - ${timeLeft.toFixed(1)}s left\n`;
            }

            interaction.reply({ content: response });
        }
    }
};