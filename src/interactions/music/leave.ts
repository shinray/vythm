import { CommandInteraction } from 'discord.js';
import Interaction from '../../models/Interaction';

export default class Leave extends Interaction<CommandInteraction> {
    name = 'leave';

    description = '"Fuck off!" - Logan Roy';

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );

        player.disconnect();

        await interaction.editReply('"Because my dad told me to."');
    };
}
