import {
    CommandInteraction,
    GuildMember,
    SlashCommandStringOption,
    VoiceChannel,
    TextChannel,
} from 'discord.js';
import Interaction from '../../models/Interaction';
import { search } from '../../services/search';

// TODO: add behavior for pause/unpause/resume

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
        const memberChannel = interaction.channel as TextChannel;
        const voiceChannel = member.voice.channel as VoiceChannel;
        if (!voiceChannel) {
            await interaction.editReply(
                "I'm too shy, I can't join on my own! You must be in a voice channel!",
            );
            return;
        }

        const query = interaction.options.get(this.options[0].name, true)
            .value as string;
        try {
            const metadata = await search(query);
            if (!metadata?.length) {
                await interaction.editReply(`no results for query ${query}`);
                return;
            }

            player.connect(voiceChannel, memberChannel);

            const trackAt = await player.add(metadata);
            // TODO: add something in the message about how many tracks we just queued, maybe playlist info
            let tracklist = '';
            metadata.slice(0, 10).forEach((t, index) => {
                const trackno = metadata.length > 1 ? `#${index + 1} - ` : null;
                tracklist += `${trackno}[${t.title}](<${t.url}>) (${t.durationRaw})\n`;
            });
            if (metadata.length > 10)
                tracklist += `...and ${metadata.length - 10} more\n`;

            await interaction.editReply(
                `searching for ${query}\n` +
                    `found ${tracklist}` +
                    `enqueuing ${metadata.length} tracks at position ${trackAt}, ` +
                    `requested by ${member.displayName}`,
            );
        } catch (e) {
            const error = e as Error;
            await interaction.editReply(error.message);
        }
    };
}
