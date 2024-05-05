import {
    CommandInteraction,
    GuildMember,
    SlashCommandIntegerOption,
    SlashCommandStringOption,
    VoiceChannel,
} from 'discord.js';
import { search } from '../../services/search';
import Interaction from '../../models/Interaction';

export default class Add extends Interaction<CommandInteraction> {
    name = 'add';

    description = 'add something to the queue';

    options = [
        new SlashCommandStringOption()
            .setName('query')
            .setDescription('Enter keyword or youtube url.')
            .setRequired(true),
        new SlashCommandIntegerOption()
            .setName('tracknumber')
            .setDescription(
                'Enter the position you want to insert the track at in queue',
            )
            .setRequired(false),
    ];

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );
        const member = interaction.member as GuildMember;

        const query = interaction.options.get(this.options[0].name, true)
            .value as string;
        const metadata = await search(query);
        if (!metadata) {
            await interaction.editReply(`no results for query ${query}`);
            return;
        }

        const trackNumberOption = interaction.options.get('tracknumber');
        if (trackNumberOption) {
            // TODO: remove
            console.debug('trackNumberOption', trackNumberOption);
            const trackNumber = trackNumberOption.value as number;
            player.insert(metadata, trackNumber);

            const response =
                'added track: ' +
                `[${metadata?.title}](${metadata?.url}) ` +
                `(${metadata?.durationRaw}), ` +
                `requested by ${member.displayName}`;
            await interaction.editReply(response);
        } else {
            // We should assume you want to connect and play.
            // const memberChannel = interaction.channel as TextChannel;
            const voiceChannel = member.voice.channel as VoiceChannel;
            if (!voiceChannel) {
                await interaction.editReply(
                    "I'm too shy, I can't join on my own! You must be in a voice channel!",
                );
                return;
            }
            player.connect(voiceChannel);
            const track = await player.add(metadata);
            await interaction.editReply(
                `added track to #${track}:` +
                    `[${metadata?.title}](${metadata?.url}) ` +
                    `(${metadata?.durationRaw}), ` +
                    `requested by ${member.displayName}`,
            );
        }
    };
}
