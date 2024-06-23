import { CommandInteraction } from 'discord.js';
import Interaction from '../../models/Interaction';
import StringBuffer from '../../utils/StringBuffer';

export default class Shuffle extends Interaction<CommandInteraction> {
    name = 'shuffle';

    description = 'Shuffles the current queue';

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );

        const tracklist = player.shuffle();

        // TODO: this just overwrites itself. Temp solution to stop crashes.
        const response = new StringBuffer(2000);

        response.addLine('New tracklist:');

        // TODO: need pagination.
        // Actually, should this even return anything? Mostly put this for debug.
        tracklist.forEach((track, index) => {
            response.addLine(
                `#${index + 1} - ${track.title} (${track.durationRaw})`,
            );
        });

        await interaction.editReply(response.toString());
    };
}
