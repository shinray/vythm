import { useQueue } from 'discord-player';
import {
    CommandInteraction,
    GuildMember,
    SlashCommandIntegerOption,
    VoiceChannel,
} from 'discord.js';
import Interaction from '../../models/Interaction';

const TRACKNOARG = 'tracknumber';

export default class Jump extends Interaction<CommandInteraction> {
    name = 'jump';

    description =
        'Jump to track. Deletes n-1 upcoming tracks and plays next track. Note that skipped tracks will not be saved in history.';

    options = [
        new SlashCommandIntegerOption()
            .setName(TRACKNOARG)
            .setDescription('Enter the track number you want to jump to.')
            .setRequired(true)
            .setMinValue(1),
    ];

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        const skipToIndex =
            (interaction.options.get(TRACKNOARG, true).value as number) - 1;
        const queue = useQueue();
        const queueLength = queue?.getSize() || 0;

        // Empty check
        if (!queue || queueLength < 1) {
            await interaction.editReply('Nowhere to jump');
            return;
        }

        // Check if user is in same channel as bot.
        const member = interaction.member as GuildMember;
        const memberVoiceChannel = member.voice.channel as VoiceChannel;
        const queueVoiceChannel = queue.channel;
        if (
            !memberVoiceChannel ||
            memberVoiceChannel.id !== queueVoiceChannel?.id
        )
            await interaction.editReply(
                'You must be in the same voice channel to use this command.',
            );

        // Bounds check
        const queueZeroIndexOffset = queueLength - 1;
        if (skipToIndex > queueZeroIndexOffset) {
            await interaction.editReply(
                `Nothing at ${skipToIndex + 1} - last track is at ${queue?.size}`,
            );
            return;
        }

        try {
            const track = queue?.tracks.at(skipToIndex);
            queue?.node.skipTo(skipToIndex);
            await interaction.editReply(
                `Skipping to ${skipToIndex + 1} - ${track?.title}`,
            );
        } catch (e: unknown) {
            console.error('Error skipping to: ', e);
            await interaction.editReply(
                `Something went wrong:\n\n${e as string}`,
            );
        }
    };
}
