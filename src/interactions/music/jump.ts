import {
    CommandInteraction,
    GuildMember,
    SlashCommandIntegerOption,
    TextChannel,
    VoiceChannel,
} from 'discord.js';
import Interaction from '../../models/Interaction';

const TRACKNOARG = 'tracknumber';

export default class Jump extends Interaction<CommandInteraction> {
    name = 'jump';

    description = 'Change the current track';

    options = [
        new SlashCommandIntegerOption()
            .setName(TRACKNOARG)
            .setDescription('Enter the track number you want to jump to.')
            .setRequired(true),
    ];

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );
        const member = interaction.member as GuildMember;
        // This one we'll require the user be in voice.
        const memberChannel = interaction.channel as TextChannel;
        const voiceChannel = member.voice.channel as VoiceChannel;
        if (!voiceChannel) {
            await interaction.editReply(
                "I'm too shy, I can't join on my own! You must be in a voice channel!",
            );
            return;
        }
        player.connect(voiceChannel, memberChannel);

        const trackNumberOption = interaction.options.get(TRACKNOARG, true);
        const trackNumber = trackNumberOption?.value as number;

        const newTrack = await player.skip(trackNumber, true);

        let response = 'skipping track!';
        if (newTrack) {
            response =
                'skipping track!\n' +
                `jumping to #${trackNumber} - [${newTrack.title}](<${newTrack.url}>) ` +
                `(${newTrack.durationRaw})\n` +
                `requested by ${member.displayName}`;
        } else {
            response = "couldn't jump, sorry!";
        }
        await interaction.editReply(response);
    };
}
