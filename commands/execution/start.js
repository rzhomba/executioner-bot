const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { logger } = require('../../modules/logging');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('start')
        .setDescription('Starts the execution on specified user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user')
                .setRequired(true)),
    async execute(interaction, scheduler) {
        const target = interaction.options.getUser('target');
        const targetMember = interaction.guild.members.cache.get(target.id);
        const adminMember = interaction.guild.members.cache.get(interaction.user.id);

        if (!targetMember.voice.channel) {
            interaction.reply({ content: 'This user isn\'t connected to any voice channel' });
            return;
        }

        const check = scheduler.add(targetMember.id, { user: targetMember, muted: false, dateStarted: new Date() });
        if (!check) {
            interaction.reply({ content: 'This user is already under execution.' });
            return;
        }

        logger.info(`Started execution on ${targetMember.user.tag} by ${adminMember.user.tag}`);
        interaction.reply({ content: 'Started execution.' });
    }
};