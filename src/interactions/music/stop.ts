import { CommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import { useQueue } from 'discord-player';
import Interaction from '../../models/Interaction';

export default class Stop extends Interaction<CommandInteraction> {
    name = 'stop';

    description = 'Stop it. Get some help.';

    options = [];

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceChannel;
        const queue = useQueue();

        if (!queue) {
            await interaction.editReply('Nothing to stop');
        } else if (
            !voiceChannel ||
            member.voice.channel?.id !== queue.channel?.id
        ) {
            await interaction.editReply('What are you doing?');
        } else {
            queue.node.stop();
            await interaction.editReply('Stopped');
        }
    };
}
