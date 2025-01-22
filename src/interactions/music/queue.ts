import { CommandInteraction } from 'discord.js';
import { useQueue } from 'discord-player';
import Interaction from '../../models/Interaction';

export default class Queue extends Interaction<CommandInteraction> {
    name = 'queue';

    description =
        'Shows the queue. Currently only supports a small slice, yell at the dev to fix this';

    options = [];

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        const queue = useQueue(interaction.guild!);

        if (!queue) {
            await interaction.editReply('Empty.');
            return;
        }

        // Get the current track
        const currentTrack = queue?.currentTrack;

        // Get the upcoming tracks
        const upcomingTracks = queue?.tracks.toArray().slice(0, 5);
        console.debug('upconming tracks', upcomingTracks.length);
        const queueLength = queue?.tracks.size;
        console.debug('queue length', queueLength);

        // Create a message with the current track and upcoming tracks
        let message = [
            `**Now Playing:** ${currentTrack?.title} - ${currentTrack?.author}`,
            '',
            '**Upcoming Tracks:**',
            ...upcomingTracks.map(
                (track, index) =>
                    `${index + 1}. ${track.title} - ${track.author}`,
            ),
        ].join('\n');
        if (queueLength > upcomingTracks.length) {
            console.debug('additional tracks');
            message += `\n...and ${queueLength - upcomingTracks.length} more`;
        }

        await interaction.editReply(message);
    };
}
