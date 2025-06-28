import { CommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import { useQueue } from 'discord-player';
import Interaction from '../../models/Interaction';

export default class Next extends Interaction<CommandInteraction> {
    name = 'next';

    description = 'Change to the next track';

    options = [];

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        const queue = useQueue();
        const queueLength = queue?.getSize() || 0;

        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceChannel;

        if (!voiceChannel) {
            await interaction.editReply(
                "I'm too shy, I can't join on my own! You must be in a voice channel!",
            );
            return;
        }

        if (voiceChannel.id !== queue?.channel?.id) {
            await interaction.editReply(
                'You must be in the same channel to use this command.',
            );
            return;
        }

        if (!queue) {
            await interaction.editReply('Queue is too small to skip!');
            return;
        }

        if (queueLength < 1) {
            queue.node.stop();
            await interaction.editReply('End of the line!');
            return;
        }

        if (!queue.isPlaying()) {
            await interaction.editReply('There is no track playing');
            return;
        }

        if (queue.node.skip()) {
            console.log('skipped');
            await interaction.editReply('Skipped track');
        } else {
            await interaction.editReply('Could not skip track');
        }
    };
}
