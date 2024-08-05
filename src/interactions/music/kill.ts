import { CommandInteraction } from 'discord.js';
import Interaction from '../../models/Interaction';

export default class Kill extends Interaction<CommandInteraction> {
    name = 'kill';

    description = 'Stop, clear, and leave.';

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );

        player.stop(true);

        player.clear();

        player.disconnect();

        const legoyoda = this.client.emojis.cache.find(
            (emoji) => emoji.name === 'legoyoda',
        );

        const response = `${legoyoda?.toString() ?? 'oof'}`;

        await interaction.editReply(response);
    };
}
