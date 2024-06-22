import {
    CommandInteraction,
    GuildMember,
    SlashCommandStringOption,
    TextChannel,
    VoiceChannel,
} from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import Interaction from '../../models/Interaction';
import { search } from '../../services/search';

export default class PlayNext extends Interaction<CommandInteraction> {
    name = 'playnext';

    description = 'play something next in queue';

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
        const textChannel = interaction.channel as TextChannel;
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
        if (!metadata?.length) {
            await interaction.editReply(`no results for query ${query}`);
            return;
        }

        player.connect(voiceChannel, textChannel);

        const nextTrackAt = player.insertNext(metadata);
        if (player.state.status === AudioPlayerStatus.Idle) {
            await player.skip(nextTrackAt);
            await interaction.editReply(
                `searching for ${query}, ` +
                    `enqueuing ${metadata.length} tracks at position ${nextTrackAt}, ` +
                    `requested by ${member.displayName}`,
            );
            return;
        }

        await interaction.editReply(
            `searching for ${query}` +
                `inserted ${metadata[0].title} at position ${nextTrackAt}` +
                `requested by ${member.displayName}`,
        );
    };
}
