import { CacheType, CommandInteraction } from 'discord.js';
import Interaction from '../../models/Interaction';

export default class Queue extends Interaction<CommandInteraction> {
    name = 'queue';

    description = 'shows the tracklist, including past and future';

    execute = async (interaction: CommandInteraction<CacheType>) => {
        const { tracks } = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );

        let response = 'Tracklist: \n';

        // TODO: this needs pagination. 2K char limit per msg
        // Plus, buttons would be nice to navigate queue
        tracks.forEach((t, index) => {
            response += `#${index + 1} - [${t.title}](<${t.url}>) (${
                t.durationRaw
            })\n`;
        });

        await interaction.editReply(response);
    };
}
