import { CommandInteraction } from 'discord.js';
import { useQueue } from 'discord-player';
import Interaction from '../../models/Interaction';

export default class Next extends Interaction<CommandInteraction> {
    name = 'next';

    description = 'Change to the next track';

    options = [];

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        const queue = useQueue(interaction.guild!);
        const queueLength = queue?.getSize() || 0;

        if (!queue || queueLength < 1) {
            await interaction.editReply('Queue is too small to skip!');
            return;
        }

        if (!queue.currentTrack) {
            await interaction.editReply('There is no track playing');
            return;
        }

        if (queue.node.skip()) {
            console.log('skipped');
            await interaction.editReply('Skipped track');
        } else {
            await interaction.editReply('Could not skip track');
        }
    };
}
