import { CommandInteraction } from 'discord.js';
import Interaction from '../../models/Interaction';

export default class Stop extends Interaction<CommandInteraction> {
    name = 'stop';

    description = 'Stop the music!';

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );
        player.stop(true);

        await interaction.editReply('sorry uwu');
    };
}
