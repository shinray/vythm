import {
    CommandInteraction,
    GuildMember,
    // SlashCommandBooleanOption,
    SlashCommandStringOption,
    TextChannel,
    VoiceChannel,
} from 'discord.js';
import { useMainPlayer } from 'discord-player';
import Interaction from '../../models/Interaction';

export default class Play extends Interaction<CommandInteraction> {
    name = 'play';

    description = 'Play a track';

    options = [
        new SlashCommandStringOption()
            .setName('query')
            .setDescription('Enter keyword or youtube url.')
            .setRequired(true),
        // new SlashCommandBooleanOption()
        //     .setName('shuffleplaylist')
        //     .setDescription('Shuffle YT playlists BEFORE queueing')
        //     .setRequired(false),
    ];

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        const player = useMainPlayer();
        const query = interaction.options.get('query', true).value as string;

        const member = interaction.member as GuildMember;
        const memberChannel = interaction.channel as TextChannel;
        const voiceChannel = member.voice.channel as VoiceChannel;

        if (!voiceChannel) {
            await interaction.editReply(
                "I'm too shy, I can't join on my own! You must be in a voice channel!",
            );
            return;
        }

        try {
            const result = await player.play(voiceChannel, query, {
                nodeOptions: {
                    metadata: { channel: memberChannel },
                    leaveOnStopCooldown: 10000,
                    leaveOnEndCooldown: 10000,
                    selfDeaf: true,
                },
            });
            await interaction.editReply(
                `${result.track.title} was added to the queue`,
            );
        } catch (error) {
            console.error('\x1b[33m%s\x1b[0m', 'Error in play command!', error);
            await interaction.editReply(
                `Couldn't play track! ${error as string}`,
            );
        }
    };
}
