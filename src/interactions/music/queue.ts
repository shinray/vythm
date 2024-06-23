import { CacheType, CommandInteraction } from 'discord.js';
import Interaction from '../../models/Interaction';
import StringBuffer from '../../utils/StringBuffer';

export default class Queue extends Interaction<CommandInteraction> {
    name = 'queue';

    description = 'shows the tracklist, including past and future';

    execute = async (interaction: CommandInteraction<CacheType>) => {
        const { tracks } = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );

        // TODO: this just overwrites itself. Temp solution to stop crashes.
        const response = new StringBuffer(2000);

        response.addLine('Tracklist:');

        if (!tracks.length) response.addLine('none!');

        // TODO: this needs pagination. 2K char limit per msg
        // Plus, buttons would be nice to navigate queue
        tracks.forEach((t, index) => {
            response.addLine(
                `#${index + 1} - [${t.title}](<${t.url}>) (${t.durationRaw})`,
            );
        });

        await interaction.editReply(response.toString());
    };
}
