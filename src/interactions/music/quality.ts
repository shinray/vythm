import {
    CommandInteraction,
    GuildMember,
    SlashCommandIntegerOption,
} from 'discord.js';
import Interaction from '../../models/Interaction';
import { StreamQuality } from '../../types/StreamQuality';

export default class Quality extends Interaction<CommandInteraction> {
    name = 'quality';

    description = 'Set audio quality';

    options = [
        new SlashCommandIntegerOption()
            .setName('quality')
            .setDescription('Enter a number from 0-2')
            .setRequired(true),
    ];

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );
        const member = interaction.member as GuildMember;

        const qualityOption = interaction.options.get(
            this.options[0].name,
            true,
        );
        const quality = (qualityOption?.value ??
            StreamQuality.LOWEST) as StreamQuality;

        player.setQuality(quality);

        const response =
            `set stream quality to ${StreamQuality[quality]}\n` +
            `requested by ${member.displayName}`;

        await interaction.editReply(response);
    };
}
