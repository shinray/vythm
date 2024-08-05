import {
    CommandInteraction,
    GuildMember,
    SlashCommandBooleanOption,
    SlashCommandStringOption,
    TextChannel,
    VoiceChannel,
} from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import Interaction from '../../models/Interaction';
import { search } from '../../services/search';
import { shuffleInPlace } from '../../utils/shuffle';

const QUERYARG = 'query';
const SHUFFLEARG = 'shuffleplaylist';

export default class PlayNext extends Interaction<CommandInteraction> {
    name = 'playnext';

    description = 'play something next in queue';

    options = [
        new SlashCommandStringOption()
            .setName(QUERYARG)
            .setDescription('Enter keyword or youtube url.')
            .setRequired(true),
        new SlashCommandBooleanOption()
            .setName(SHUFFLEARG)
            .setDescription(
                'If the query is a playlist, shuffle it before queueing',
            )
            .setRequired(false),
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

        const query = interaction.options.get(QUERYARG, true).value as string;
        const metadata = await search(query);
        if (!metadata?.length) {
            await interaction.editReply(`no results for query ${query}`);
            return;
        }

        const shuffleOption = interaction.options.get(SHUFFLEARG, false);
        const shuffleValue: boolean | undefined =
            (shuffleOption?.value as boolean) ?? undefined;

        if (shuffleValue) shuffleInPlace(metadata);

        let tracklist = '';
        metadata.slice(0, 10).forEach((t, index) => {
            const trackno = metadata.length > 1 ? `#${index + 1} - ` : '';
            tracklist += `${trackno}[${t.title}](<${t.url}>) (${t.durationRaw})\n`;
        });
        if (metadata.length > 10)
            tracklist += `...and ${metadata.length - 10} more\n`;

        player.connect(voiceChannel, textChannel);

        const nextTrackAt = player.insertNext(metadata);
        if (player.state.status === AudioPlayerStatus.Idle) {
            await player.skip(nextTrackAt);
        }

        await interaction.editReply(
            `searching for ${query}\n` +
                `found ${tracklist}` +
                `enqueuing ${metadata.length} tracks at position ${nextTrackAt}, ` +
                `requested by ${member.displayName}`,
        );
    };
}
