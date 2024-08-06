import {
    CommandInteraction,
    GuildMember,
    SlashCommandIntegerOption,
    SlashCommandStringOption,
    VoiceChannel,
    TextChannel,
    SlashCommandBooleanOption,
} from 'discord.js';
import { search } from '../../services/search';
import Interaction from '../../models/Interaction';
import { shuffleInPlace } from '../../utils/shuffle';

const QUERYARG = 'query';
const TRACKNOARG = 'tracknumber';
const SHUFFLEARG = 'shuffleplaylist';

export default class Add extends Interaction<CommandInteraction> {
    name = 'add';

    description = 'add something to the queue';

    options = [
        new SlashCommandStringOption()
            .setName(QUERYARG)
            .setDescription('Enter keyword or youtube url.')
            .setRequired(true),
        new SlashCommandIntegerOption()
            .setName(TRACKNOARG)
            .setDescription(
                'Enter the position you want to insert the track at in queue',
            )
            .setRequired(false),
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

        const trackNumberOption = interaction.options.get(TRACKNOARG, false);
        if (trackNumberOption) {
            const trackNumber = trackNumberOption.value as number;
            // TODO: shuffle
            player.insert(metadata, trackNumber);

            const response =
                `searching for ${query}\n` +
                `found ${tracklist}` +
                `enqueuing ${metadata.length} tracks at position: ${trackNumber}, ` +
                `requested by ${member.displayName}`;
            await interaction.editReply(response);
        } else {
            // We should assume you want to connect and play.
            const memberChannel = interaction.channel as TextChannel;
            const voiceChannel = member.voice.channel as VoiceChannel;
            if (!voiceChannel) {
                await interaction.editReply(
                    "I'm too shy, I can't join on my own! You must be in a voice channel!",
                );
                return;
            }
            player.connect(voiceChannel, memberChannel);
            const track = await player.add(metadata);
            await interaction.editReply(
                `searching for ${query}\n` +
                    `found ${tracklist}` +
                    `enqueuing ${metadata.length} tracks at position: ${track}, ` +
                    `requested by ${member.displayName}`,
            );
        }
    };
}
