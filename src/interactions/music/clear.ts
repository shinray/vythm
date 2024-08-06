import { CommandInteraction } from 'discord.js';
import Interaction from '../../models/Interaction';

export default class Clear extends Interaction<CommandInteraction> {
    name = 'clear';

    description = 'Clears the queue.';

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );

        const n = player.clear();

        await interaction.editReply(`Cleared the queue of ${n} items.`);
    };
}
