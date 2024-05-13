import { CommandInteraction, SlashCommandIntegerOption } from 'discord.js';
import Interaction from '../../models/Interaction';

export default class Remove extends Interaction<CommandInteraction> {
    name = 'remove';

    description: string = 'remove something from the queue';

    options = [
        new SlashCommandIntegerOption()
            .setName('tracknumber')
            .setDescription('Enter the number of the track you want to remove')
            .setRequired(true),
    ];

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );

        const trackNumber = interaction.options.get(this.options[0].name, true)
            .value as number;

        const track = player.remove(trackNumber);
        let response;
        if (track)
            response = `removed ${track.title} from position ${trackNumber}`;
        else response = `There was a problem removing track ${trackNumber}`;

        await interaction.editReply(response);
    };
}
