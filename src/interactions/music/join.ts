import {
    CommandInteraction,
    GuildMember,
    TextChannel,
    VoiceChannel,
} from 'discord.js';
import Interaction from '../../models/Interaction';

export default class Join extends Interaction<CommandInteraction> {
    name = 'join';

    description = 'Join your current voice channel';

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );
        const member = interaction.member as GuildMember;
        // This one obviously requires the user be in voice.
        const memberChannel = interaction.channel as TextChannel;
        const voiceChannel = member.voice.channel as VoiceChannel;
        if (!voiceChannel) {
            await interaction.editReply(
                "I'm too shy, I can't join on my own! You must be in a voice channel!",
            );
            return;
        }
        player.connect(voiceChannel, memberChannel);
        await interaction.editReply('Hi!');
    };
}
