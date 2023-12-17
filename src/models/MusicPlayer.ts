/* eslint @typescript-eslint/no-unsafe-return: "warn" */
/* eslint @typescript-eslint/no-unsafe-member-access: "warn" */
/* eslint @typescript-eslint/no-unsafe-assignment: "warn" */
/* eslint @typescript-eslint/no-explicit-any: "warn" */
/* eslint @typescript-eslint/require-await: "warn" */
// TODO: replace 'any'
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
 * * seek
 * * loop
 * * next
 * * prev
 * * skip
 * * jump
 * * stop
 * * add/insert/queue
 * * remove
 * * shuffle
 * * get/set quality level [ 0 = Lowest, 1 = Medium, 2 = Highest ]
 */
import {
    AudioPlayer,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    VoiceConnection,
    joinVoiceChannel,
} from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';
import { YouTubeVideo } from 'play-dl';
import DiscordClient from './client';
import { LoopMode, StreamQuality, Track } from '../types/definitions';
import { createStream } from '../utils/audio';

export default class MusicPlayer extends AudioPlayer {
    readonly client: DiscordClient;

    readonly guildId: string;

    channelId: string | undefined;

    voiceChannelId: string | undefined;

    tracks: YouTubeVideo[] = [];

    // Track position index
    trackAt: number = 0;

    loopMode: LoopMode = 'off';

    quality: StreamQuality = StreamQuality.lowest;

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

    add = async (track: YouTubeVideo) => {
        this.tracks.push(track);

        // If we're not playing anything, start playing.
        if (
            this.tracks.length === 1 ||
            this.state.status === AudioPlayerStatus.Idle
        ) {
            this.trackAt = this.tracks.length;
            await this.play(track);
        }

        // Probably not strictly necessary to return tracklength.
        return this.tracks.length;
    };

    remove = (trackNumber: number) => {
        if (trackNumber < 0) return;

        // Get currently playing, if applicable
        let track: YouTubeVideo;
        if (this.trackAt !== 0) {
            track = this.tracks[this.trackAt - 1];
        }

        this.tracks.splice(trackNumber - 1, 1);

        // Update current track position, if applicable
        if (track) {
            this.trackAt = this.tracks.findIndex((t) => t.id === track.id) + 1;
        }
    };

    // Returns track data - useful for some cases where context is required
    play = async (track: YouTubeVideo) => {
        super.play(await createStream(track));
        return track;
    };

    stop = (force?: boolean | undefined): boolean => {
        this.stopCalled = true;
        return super.stop(force);
    };

    // Attempts to parse mode string
    setLoop = (mode: string) => {
        this.loopMode = (mode as LoopMode) || 'off';
    };

    setQuality = (quality: number) => {
        // TODO: maybe do some rounding or something
        if (!Number.isInteger(quality)) return;
        this.quality = quality;
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
