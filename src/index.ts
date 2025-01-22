import { Events } from 'discord.js';
import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import DiscordClient from './models/client';

// Initialize client
const client = new DiscordClient();

// Initialize discord-player
const player = new Player(client);

// Register discord-player extractors
player.extractors
    .register(YoutubeiExtractor, {})
    .then(() => {
        console.debug('Registered youtubeiextractor');
    })
    .catch(() => console.error("Couldn't register youtubeiextractor"));

// Debug, can be removed
client.on(Events.InteractionCreate, (interaction) => {
    if ('commandName' in interaction)
        console.debug(
            `${interaction.user.username}:commandName`,
            interaction.commandName,
        );
});
