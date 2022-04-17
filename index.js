const { Client, Intents } = require('discord.js');
const { token, roleId } = require('./modules/env.js');
const { logger } = require('./modules/logging.js');
const { duration } = require('./config.json');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
});

client.once('ready', () => {
    logger.info('Ready!');
});

const totalDuration = +duration.totalDuration;
const muteDuration = +duration.muteDuration;
const muteTimeout = +duration.muteTimeout;

const executedUsers = [];
const getRecord = (targetId) => {
    return executedUsers.find((record) => record.targetId === targetId);
};

const executionStart = async (interaction, target, untilTime, mute) => {
    const record = getRecord(target.user.id);
    const currentTime = new Date();

    if (record === undefined || record.untilTime < currentTime) {
        await executionStop(interaction, target);
        return;
    }

    if (target.voice.channel)
        await target.voice.setMute(mute);

    const timeout = mute ? muteDuration * 1000 : muteTimeout * 1000;
    setTimeout(() => executionStart(interaction, target, untilTime, !mute), timeout);
};

const executionStop = async (interaction, target) => {
    await target.voice.setMute(false);

    for (const [i, v] of executedUsers.entries()) {
        if (v.targetId === target.user.id)
            executedUsers.splice(i, 1);
    }

    logger.info(`Execution on user ${target.user.tag} ended.`);
};

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = interaction.commandName;
    const subCommand = interaction.options.getSubcommand();
    const target = interaction.options.getUser('target');

    if (command === 'execution') {
        const adminMember = interaction.guild.members.cache.get(interaction.user.id);
        const hasRole = adminMember.roles.cache.has(roleId);

        if (!hasRole) {
            interaction.reply({ content: 'You don\'t have enough permissions to do this.' });
            return;
        }

        const currentTime = new Date();

        if (subCommand === 'start') {
            const targetMember = interaction.guild.members.cache.get(target.id);

            if (!targetMember.voice.channel) {
                interaction.reply({ content: 'This user isn\'t connected to any voice channel' });
                return;
            }

            const record = getRecord(targetMember.user.id);
            if (record !== undefined && record.untilTime > currentTime) {
                interaction.reply({ content: 'This user is already under execution.' });
                return;
            }

            const untilTime = new Date().setSeconds(currentTime.getSeconds() + totalDuration);
            const isMuted = targetMember.voice.mute;

            executedUsers.push({ targetId: targetMember.user.id, untilTime: untilTime });
            await executionStart(interaction, targetMember, untilTime, !isMuted);

            logger.info(`Starting execution on user ${targetMember.user.tag} by user ${adminMember.user.tag}`);
            interaction.reply({ content: 'Starting execution.' });
        } else if (subCommand === 'stop') {
            const targetMember = interaction.guild.members.cache.get(target.id);

            const record = getRecord(targetMember.user.id);
            if (record === undefined || record.untilTime < currentTime) {
                interaction.reply({ content: 'This user isn\'t under execution.' });
                return;
            }

            await executionStop(interaction, targetMember);

            logger.info(`Stopping execution on user ${targetMember.user.tag}`);
            interaction.reply({ content: 'Stopping execution.' });
        } else if (subCommand === 'stopall') {
            if (executedUsers.length === 0) {
                interaction.reply({ content: 'There are no users under execution currently.' });
                return;
            }

            const userIds = executedUsers.map((v) => v.targetId);

            const userList = [];
            for (const userId of userIds) {
                userList.push(interaction.guild.members.cache.get(userId));
            }
            for (const user of userList) {
                await executionStop(interaction, user);
            }

            logger.info(`Stopping execution on ${userList.length} users by user ${adminMember.user.tag}`);
            interaction.reply({ content: `Stopped execution on ${userList.length} users.` });
        } else if (subCommand === 'list') {
            const userIds = executedUsers.map((v) => v.targetId);

            const userList = [];
            for (const userId of userIds) {
                userList.push(interaction.guild.members.cache.get(userId));
            }

            let counter = 1;
            let response = '';
            for (const user of userList) {
                const timestamp = getRecord(user.id).untilTime;
                const time = new Date(timestamp).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
                response += `${counter++}. ${user.toString()} - until ${time}\n`;
            }

            if (response.length === 0)
                response = 'There are no users under execution.';

            interaction.reply({ content: response });
        }
    }
});

client.login(token)
    .then(() => logger.info('Logged in successfully!'));