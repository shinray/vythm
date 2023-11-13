import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

const execute = async (interaction) => {
    console.debug('ping received ', interaction);
    try {
        await interaction.reply('Pong!');
    } catch (e) {
        console.error('ping reply error ', e);
    }
};

export { data, execute };
