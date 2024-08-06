import { CommandInteraction, SlashCommandIntegerOption } from 'discord.js';
import Interaction from '../../models/Interaction';

const TRACKNOARG = 'tracknumber';

export default class Remove extends Interaction<CommandInteraction> {
    name = 'remove';

    description: string = 'remove something from the queue';

    options = [
        new SlashCommandIntegerOption()
            .setName(TRACKNOARG)
            .setDescription('Enter the number of the track you want to remove')
            .setRequired(true),
    ];

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );

        // TODO: support a range rather than just a single index
        const trackNumber = interaction.options.get(TRACKNOARG, true)
            .value as number;

        const track = player.remove(trackNumber);
        let response;
        if (track)
            response =
                `removed [${track.title}](<${track.url}>)` +
                `(${track.durationRaw}) from position ${trackNumber}`;
        else response = `There was a problem removing track ${trackNumber}`;

        await interaction.editReply(response);
    };
}
