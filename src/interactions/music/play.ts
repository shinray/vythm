import {
    CommandInteraction,
    GuildMember,
    SlashCommandStringOption,
    VoiceChannel,
} from 'discord.js';
import Interaction from '../../models/Interaction';
import { search } from '../../services/search';

export default class Play extends Interaction<CommandInteraction> {
    name = 'play';

    description = 'play with me';

    options = [
        new SlashCommandStringOption()
            .setName('query')
            .setDescription('Enter keyword or youtube url.')
            .setRequired(true),
    ];

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );
        const member = interaction.member as GuildMember;

        // const memberChannel = interaction.channel as TextChannel;
        const voiceChannel = member.voice.channel as VoiceChannel;
        if (!voiceChannel) {
            await interaction.editReply(
                "I'm too shy, I can't join on my own! You must be in a voice channel!",
            );
            return;
        }

        const query = interaction.options.get(this.options[0].name, true)
            .value as string;
        const metadata = await search(query);
        if (!metadata) {
            await interaction.editReply(`no results for query ${query}`);
            return;
        }

        player.connect(voiceChannel);

        const trackAt = await player.add(metadata);

        await interaction.editReply(
            `now playing #${trackAt}: ` +
                `[${metadata?.title}](${metadata?.url}) ` +
                `(${metadata?.durationRaw}), ` +
                `requested by ${member.displayName}`,
        );
    };
}
