const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { logger } = require('../../modules/logging');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('stopall')
        .setDescription('Stops punishment of all users.'),
    async execute(interaction, scheduler) {
        const adminMember = interaction.guild.members.cache.get(interaction.user.id);

        const count = await scheduler.clearAll({ manual: true });
        if (count === 0) {
            interaction.reply({ content: 'There are no users under execution currently.' });
            return;
        }

        logger.info(`Stopping execution on ${count} users by ${adminMember.user.tag}`);
        interaction.reply({ content: `Stopped execution on ${count} users.` });
    }
};