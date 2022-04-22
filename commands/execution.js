const { SlashCommandBuilder } = require('@discordjs/builders');
const { loadSubcommands } = require('../modules/load-subcommands');
const { Scheduler } = require('../modules/scheduler');
const { duration } = require('../config.json');
const { logger } = require('../modules/logging');
const { roleId } = require('../modules/env');

const command = new SlashCommandBuilder()
    .setName('execution')
    .setDescription('Controls user executions.');
const subcommands = loadSubcommands(command);

const intervals = [0];
let counter = 0, muted = false;
do {
    counter += muted ? duration.muteTimeout : duration.muteDuration;
    muted = !muted;

    intervals.push(counter * 1000);
} while (counter <= duration.totalDuration);

const scheduler = new Scheduler(intervals, async (target) => {
    const { user, muted } = target.data;
    if (user.voice.channel) {
        await user.voice.setMute(!muted);
    }

    target.data.muted = !muted;
}, async (target) => {
    const { user, manual } = target.data;
    if (user.voice.channel) {
        await user.voice.setMute(false);
    }

    if (manual) {
        logger.info(`Execution on user ${target.data.user.tag} ended.`);
    }
});

module.exports = {
    data: command,
    async execute(interaction) {
        const subcommandName = interaction.options.getSubcommand();

        const subcommand = subcommands.get(subcommandName);
        if (!subcommand) {
            return;
        }

        if (roleId) {
            const adminMember = interaction.guild.members.cache.get(interaction.user.id);
            const hasRole = adminMember.roles.cache.has(roleId);

            if (!hasRole) {
                interaction.reply({ content: 'You don\'t have enough permissions to use this.' });
                return;
            }
        }

        await subcommand(interaction, scheduler);
    }
};