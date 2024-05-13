import { CommandInteraction } from 'discord.js';
import Interaction from '../../models/Interaction';

export default class Next extends Interaction<CommandInteraction> {
    name = 'next';

    description = "It's for a church, honey!";

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );
        const metadata = await player.next();

        if (metadata) {
            await interaction.editReply(
                // `next: ${metadata?.title}`
                "Don't need the attitude! Next!",
            );
        } else {
            await interaction.editReply("that's all, folks!");
        }
    };
}
