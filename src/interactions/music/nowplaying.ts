import { CommandInteraction } from 'discord.js';
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
        await interaction.editReply(`Now playing: ${currentTrack.cleanTitle}`);
    };
}
