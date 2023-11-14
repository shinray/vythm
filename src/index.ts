import { Events } from 'discord.js';
import DiscordClient from './models/client';

const client = new DiscordClient();

client.on(Events.InteractionCreate, (interaction) => {
    if ('commandName' in interaction)
        console.debug('commandName', interaction.commandName);
});
