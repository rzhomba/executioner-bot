const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { duration } = require('../../config.json');
const { logger } = require('../../modules/logging');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('list')
        .setDescription('Displays the list of users that are under the execution.'),
    async execute(interaction, scheduler) {
        const adminMember = interaction.guild.members.cache.get(interaction.user.id);

        logger.info(`Execution list requested by ${adminMember.user.tag}`);

        const list = scheduler.targets;

        if (list.length === 0) {
            interaction.reply({ content: 'There are no users under execution.' });
            return;
        }

        let counter = 1;
        let response = '';
        for (const elem of list) {
            const { user, dateStarted } = elem.data;
            const timeLeft = duration.totalDuration - (new Date() - dateStarted) / 1000;
            response += `${counter++}. ${user.toString()} - ${timeLeft.toFixed(1)}s left\n`;
        }

        interaction.reply({ content: response });
    }
};
