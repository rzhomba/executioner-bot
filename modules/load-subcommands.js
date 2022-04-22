const fs = require('node:fs');
const path = require('path');
const { Collection } = require('discord.js');

const loadSubcommands = (command) => {
    const dir = path.resolve(`./commands/${command.name}`);
    const subcommandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));

    const subcommands = new Collection();
    for (const file of subcommandFiles) {
        const subcommand = require(`${dir}/${file}`);
        command.addSubcommand(() => subcommand.data);
        subcommands.set(subcommand.data.name, subcommand.execute);
    }

    return subcommands;
};

module.exports = {
    loadSubcommands
};