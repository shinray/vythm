import { CommandInteraction } from 'discord.js';
import Interaction from '../../models/Interaction';

export default class Prev extends Interaction<CommandInteraction> {
    name = 'prev';

    description = 'Spin 360 degrees and moonwalk away';

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );
        const metadata = await player.prev();

        if (metadata) {
            await interaction.editReply(
                // `prev: ${metadata?.title}`,
                'I never look back, dahling, it distracts from the now.',
            );
        } else {
            await interaction.editReply("that's all, folks!");
        }
    };
}
