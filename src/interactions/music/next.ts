import { CommandInteraction } from 'discord.js';
import Interaction from '../../models/Interaction';

export default class Stop extends Interaction<CommandInteraction> {
    name = 'next';

    description = "It's for a church, honey!";

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );
        const metadata = player.next();

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
