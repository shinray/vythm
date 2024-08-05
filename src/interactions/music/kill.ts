import {
    CommandInteraction,
    GuildMember,
    // REST,
    TextChannel,
    VoiceChannel,
} from 'discord.js';
import { join } from 'path';
import { createAudioResource } from '@discordjs/voice';
import Interaction from '../../models/Interaction';
// import configJson from '../../config.json';

// TODO: clean this up. fix this later.

export default class Kill extends Interaction<CommandInteraction> {
    name = 'kill';

    description = 'Stop, clear, and leave.';

    execute = async (interaction: CommandInteraction) => {
        const player = this.client.musicPlayers.getOrCreate(
            interaction.guildId!,
        );

        const member = interaction.member as GuildMember;
        const memberChannel = interaction.channel as TextChannel;
        const voiceChannel = member.voice.channel as VoiceChannel;

        // DiscordAPIError[20001]: Bots cannot use this endpoint
        // const { token } = configJson;
        // const rest = new REST({ version: '9' }).setToken(token);
        // try {
        //     const { voiceChannelId } = player;

        //     const body = {
        //         sound_id: '1269840661507608656',
        //         emoji_id: '1269840822954627072',
        //         emoji_name: '😵',
        //         source_guild_id: '429171770218774528',
        //     };
        //     const response = await rest.post(
        //         `/channels/${voiceChannelId}/send-soundboard-sound`,
        //         {
        //             body: JSON.stringify(body),
        //         },
        //     );
        //     console.debug('Response: ', response);
        // } catch (e) {
        //     console.error('Error calling soundboard api', e);
        // }
        const path = join(
            __dirname,
            '../../../assets',
            'lego-yoda-death-sound-effect.mp3',
        );
        const resource = createAudioResource(path);

        player.connect(voiceChannel, memberChannel);

        player.play(resource);

        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });

        player.stop(true);

        player.clear();

        player.disconnect();

        const legoyoda = this.client.emojis.cache.find(
            (emoji) => emoji.name === 'legoyoda',
        );

        const response = `${legoyoda?.toString() ?? 'oof'}`;

        await interaction.editReply(response);
    };
}
