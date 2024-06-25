import {
    CommandInteraction,
    GuildMember,
    SlashCommandStringOption,
    TextChannel,
    VoiceChannel,
} from 'discord.js';
import Interaction from '../../models/Interaction';
import { search } from '../../services/search';

export default class PlayNow extends Interaction<CommandInteraction> {
    name = 'playnow';

    description = 'skip current song and play now';

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
        let tracklist = '';
        metadata.slice(0, 10).forEach((t, index) => {
            const trackno = metadata.length > 1 ? `#${index + 1} - ` : null;
            tracklist += `${trackno}[${t.title}](<${t.url}>) (${t.durationRaw})\n`;
        });
        if (metadata.length > 10)
            tracklist += `...and ${metadata.length - 10} more\n`;

        player.connect(voiceChannel, textChannel);

        const nextTrackAt = player.insertNext(metadata);
        await player.skip(nextTrackAt, true); // force skip current song
        const response =
            'skipping track!\n' +
            `searching for ${query}\n` +
            `found ${tracklist}` +
            `enqueuing ${metadata.length} tracks at position ${nextTrackAt}, ` +
            `requested by ${member.displayName}`;

        await interaction.editReply(response);
    };
}
