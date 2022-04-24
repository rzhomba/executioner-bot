const { SlashCommandBuilder } = require('@discordjs/builders');
const { Scheduler } = require('../modules/scheduler');
const { deportation } = require('../config.json');
const { logger } = require('../modules/logging');
const { roleId } = require('../modules/env');

const intervals = [];
for (let i = 1; i <= deportation.moveCount; i++) {
    intervals.push(deportation.moveTimeout * i * 1000);
}

const scheduler = new Scheduler(intervals, async (data) => {
    const { user, channels } = data;
    if (user.voice.channel) {
        const randomChannel = channels[Math.floor(Math.random() * channels.length)];
        await user.voice.setChannel(randomChannel);
    }
}, async (data) => {
    const { user, initial, manual } = data;
    if (user.voice.channel) {
        await user.voice.setChannel(initial);
    }

    if (!manual) {
        logger.info(`Deportation of user ${user.user.tag} ended.`);
    }
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deportation')
        .setDescription('Controls user deportations.')
        .addSubcommand(subcommand => subcommand
            .setName('start')
            .setDescription('Starts the execution on specified user.')
            .addUserOption(option => option.setName('target')
                .setDescription('The user')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('clear')
            .setDescription('Stops deportation of all users.')),
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

            const check = scheduler.has(target.user.id);
            if (check) {
                interaction.reply({ content: 'This user is already under deportation.', ephemeral: true });
                return;
            }

            const guildChannels = [];
            for (const channel of interaction.guild.channels.cache.values()) {
                guildChannels.push(channel);
            }

            const voiceChannels = guildChannels.filter(channel => channel.type === 'GUILD_VOICE');

            await scheduler.add(target.id, { user: target, channels: voiceChannels, initial: target.voice.channel });

            logger.info(`Started deportation ${target.user.tag} by ${admin.user.tag}`);
            interaction.reply({ content: 'Started deportation.' });
        } else if (subcommand === 'clear') {
            const count = await scheduler.clearAll({ manual: true });
            if (count === 0) {
                interaction.reply({ content: 'There are no users under deportation currently.', ephemeral: true });
                return;
            }

            logger.info(`Stopping deporting ${count} users by ${admin.user.tag}`);
            interaction.reply({ content: `Stopped deporting ${count} users.` });
        }
    }
};