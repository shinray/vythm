/**
 * What does MusicPlayer need to do?
 * * Unique to guild
 * * store connection
 * * store current voice channel
 * * connect to voice channel
 * * disconnect from voice channel
 * * store tracklist
 * * handle timeout/idle
 * * play
 * * pause
 * * loop
 * * next
 * * prev
 * * skip
 * * jump
 * * stop
 * * add/insert/queue
 * * remove
 * * shuffle
 */
import {
    AudioPlayer,
    NoSubscriberBehavior,
    VoiceConnection,
    joinVoiceChannel,
} from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';
import DiscordClient from './client';

export default class MusicPlayer extends AudioPlayer {
    readonly client: DiscordClient;

    readonly guildId: string;

    channelId: string | undefined;

    voiceChannelId: string | undefined;

    idleTimer = 60000;

    private connection: VoiceConnection | undefined;

    private stopCalled = false;

    private timeout: NodeJS.Timeout | undefined;

    constructor(client: DiscordClient, guildId: string) {
        super({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
        this.client = client;
        this.guildId = guildId;
    }

    connect = (voiceChannel: VoiceChannel) => {
        // Dedupe
        if (this.voiceChannelId && this.voiceChannelId === voiceChannel.id)
            return;
        this.voiceChannelId = voiceChannel.id;
        this.connection = joinVoiceChannel({
            guildId: this.guildId,
            channelId: this.voiceChannelId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        this.connection.subscribe(this);

        this.setTimeout();
    };

    disconnect = (): void => {
        this.connection?.destroy();
        this.connection = undefined;
        this.voiceChannelId = undefined;
    };

    setTimeout = () => {
        if (!this.timeout) {
            this.stopCalled = false;
            this.timeout = setTimeout(() => this.disconnect(), this.idleTimer);
        }
    };

    clearTimeout = () => {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    };
}
