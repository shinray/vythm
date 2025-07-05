import { Events } from 'discord.js';
import { Player } from 'discord-player';
import { YoutubeiExtractor, YoutubeiOptions } from 'discord-player-youtubei';
import DiscordClient from './models/client';

// Initialize client
const client = new DiscordClient();

// Initialize discord-player
const player = new Player(client);

// Configure player. TODO: put each into a file and then do another dir parse.

player.events.on('playerStart', async (queue, track) => {
    let message = `Started playing **[${track.title}](${track.url})** (${track.duration}) - ${track.author}`;
    if (track.requestedBy)
        message += `\nRequested by ${track.requestedBy.displayName}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await queue.metadata.interaction.channel?.send(message);
});

player.events.on('playerError', (_, e) => console.error('playerError', e));

player.events.on('emptyQueue', () => console.debug("Job's done!"));

// Register discord-player extractors

const youtubeiconf: YoutubeiOptions = {
    generateWithPoToken: true,
    // useServerAbrStream: true,
    // overrideBridgeMode: 'yt',
    // streamOptions: {
    //     useClient: 'WEB',
    // },
    // innertubeConfigRaw: {
    //     user_agent:
    //         'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0',
    // },
    overrideDownloadOptions: {
        quality: 'bestefficiency',
        type: 'audio',
        codec: 'mp4a',
    },
};

player.extractors
    .register(YoutubeiExtractor, youtubeiconf)
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
            ...(interaction.options.data.length > 0
                ? [interaction.options.data]
                : []),
        );
});
