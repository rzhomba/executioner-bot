const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { logger } = require('../../modules/logging');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('stop')
        .setDescription('Stops punishment of the specified user.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user')
                .setRequired(true)),
    async execute(interaction, scheduler) {
        const target = interaction.options.getUser('target');
        const targetMember = interaction.guild.members.cache.get(target.id);
        const adminMember = interaction.guild.members.cache.get(interaction.user.id);

        const check = await scheduler.clear(targetMember.id, { user: targetMember, manual: true });
        if (!check) {
            interaction.reply({ content: 'This user isn\'t under execution.' });
            return;
        }

        logger.info(`Stopped execution on ${targetMember.user.tag} by ${adminMember.user.tag}`);
        interaction.reply({ content: 'Stopped execution.' });
    }
};