import { CommandInteraction, SlashCommandIntegerOption } from 'discord.js';
import Interaction from '../../models/Interaction';
import StringBuffer from '../../utils/StringBuffer';
import { clamp } from '../../utils/ioutils';

const STARTPOSARG = 'start';
const ENDPOSARG = 'end';

export default class Shuffle extends Interaction<CommandInteraction> {
    name = 'shuffle';

    description = 'Shuffles the current queue';

    options = [
        new SlashCommandIntegerOption()
            .setName(STARTPOSARG)
            .setDescription('Shuffle starting from this position')
            .setRequired(false),
        new SlashCommandIntegerOption()
            .setName(ENDPOSARG)
            .setDescription('Shuffle ending including this position')
            .setRequired(false),
    ];

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );
        const playlistLength = player.tracks.length;

        // Handle start and end arguments, if they exist.
        const startOption = interaction.options.get(STARTPOSARG, false);
        const endOption = interaction.options.get(ENDPOSARG, false);
        let startIndex: number | undefined;
        let endIndex: number | undefined;
        // Clamp inputs to valid indices. Remember, min is 1, max is length.
        // Shuffle function should internally convert from human to computer indices.
        if (startOption) {
            const startValue = startOption.value as number;
            startIndex = clamp(startValue, 1, playlistLength);
        }
        if (endOption) {
            const endValue = endOption.value as number;
            // If end is less than start, handle it.
            if (startOption && (startOption.value as number) > endValue) {
                endIndex = startOption.value as number;
            } else {
                endIndex = clamp(endValue, 1, playlistLength);
            }
        }

        const tracklist = player.shuffle(startIndex, endIndex);

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
