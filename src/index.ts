import { Events } from 'discord.js';
import DiscordClient from './models/client';

const client = new DiscordClient();

client.once(Events.ClientReady, async (c) => {
    await client.interactions.deploy();
    console.log(`Client ready, logging in as ${c.user.tag}`);
});
client.on(Events.InteractionCreate, (interaction) => {
    console.debug('commandName', interaction.commandName);
});
