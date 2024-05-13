import { CommandInteraction } from 'discord.js';
import Interaction from '../../models/Interaction';

export default class Shuffle extends Interaction<CommandInteraction> {
    name = 'shuffle';

    description = 'Shuffles the current queue';

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );

        const tracklist = player.shuffle();

        let response = 'New tracklist: \n';

        // TODO: need pagination.
        // Actually, should this even return anything? Mostly put this for debug.
        tracklist.forEach((track, index) => {
            response += `#${index + 1} - ${track.title} (${
                track.durationRaw
            })\n`;
        });

        await interaction.editReply(response);
    };
}
