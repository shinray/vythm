import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import Interaction from '../../models/Interaction';

export default class NowPlaying extends Interaction<CommandInteraction> {
    name = 'nowplaying';

    description = "What's cooking, good looking?";

    options = [];

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        const queue = useQueue();

        if (!queue) {
            await interaction.editReply('Nope!');
            return;
        }

        const currentTrack = queue?.currentTrack;

        if (!currentTrack) {
            await interaction.editReply('Crickets...');
            return;
        }

        console.debug('current track', currentTrack);

        const embed = new EmbedBuilder();
        const progress = queue.node.createProgressBar();
        embed.setAuthor({
            name: `${queue.currentTrack.title} (${queue.currentTrack.duration}) - ${queue.currentTrack.author}`,
            url: queue.currentTrack.url,
        });
        embed.setDescription(
            `${progress}\n\nRequested by: <@${queue.currentTrack.requestedBy?.id}>`,
        );
        embed.setThumbnail(queue.currentTrack.thumbnail);
        // await interaction.editReply(`Now playing: ${currentTrack.cleanTitle}`);
        await interaction.editReply({ embeds: [embed] });
    };
}
