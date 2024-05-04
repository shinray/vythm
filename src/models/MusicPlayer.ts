/* eslint @typescript-eslint/no-unsafe-return: "warn" */
/* eslint @typescript-eslint/no-unsafe-member-access: "warn" */
/* eslint @typescript-eslint/no-unsafe-assignment: "warn" */
/* eslint @typescript-eslint/no-explicit-any: "warn" */
/* eslint @typescript-eslint/require-await: "warn" */
/* eslint class-methods-use-this: "warn" */
// TODO: replace all instances of 'any' i.e. track/track metadata.
// Need to find some kind of type that unifies yt, spotify, soundcloud, deezer...
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
import { LoopMode } from '../types/LoopMode';
import { StreamQuality } from '../types/StreamQuality';
import { createStream } from '../utils/audio';

export default class MusicPlayer extends AudioPlayer {
    readonly client: DiscordClient;

    readonly guildId: string;

    channelId: string | undefined;

    voiceChannelId: string | undefined;

    tracks: YouTubeVideo[] = [];

    // Track position index
    trackAt: number = 0;

    loopMode: LoopMode = LoopMode.OFF;

    quality: StreamQuality = StreamQuality.LOWEST;

    idleTimer = 60000; // consider extracting to a constant or config file

    private connection: VoiceConnection | undefined;

    private stopCalled = false;

    private timeout: NodeJS.Timeout | undefined;

    constructor(client: DiscordClient, guildId: string) {
        super({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
        this.client = client;
        this.guildId = guildId;
        this.on(AudioPlayerStatus.Playing, () => this.onPlay());
        this.on(AudioPlayerStatus.Idle, this.onIdleWrapper); // handle song advance
        // Debug stuff, remove later.
        this.on(AudioPlayerStatus.Paused, () => this.onPause());
        this.on(AudioPlayerStatus.AutoPaused, () => this.onAutoPause());
        this.on(AudioPlayerStatus.Buffering, () => this.onBuffering());
    }

    /**
     * Commands instance to join a voice channel. Has idle timeout.
     * @param {VoiceChannel} voiceChannel Discord voice channel object
     * @returns {void}
     */
    connect = (voiceChannel: VoiceChannel): void => {
        // Dedupe
        if (this.voiceChannelId === voiceChannel.id) return;
        this.voiceChannelId = voiceChannel.id;
        this.connection = joinVoiceChannel({
            guildId: this.guildId,
            channelId: this.voiceChannelId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        this.connection.subscribe(this);

        this.setIdleTimeout();
    };

    /**
     * Destroy connection, cleanup.
     */
    disconnect = (): void => {
        this.connection?.destroy();
        this.connection = undefined;
        this.voiceChannelId = undefined;
    };

    /**
     * Adds a track to the play queue
     * @param track Audio to be queued
     * @returns {number} length of queue
     */
    add = async (track: YouTubeVideo): Promise<number> => {
        this.tracks.push(track);

        console.debug('Player.Add! Current tracklist size', this.tracks.length);

        const isNotPlaying =
            this.tracks.length === 1 ||
            this.state.status === AudioPlayerStatus.Idle;
        if (isNotPlaying) {
            this.trackAt = this.tracks.length;
            console.debug(`playing track ${track.title}`);
            await this.playTrack(track);
        }

        // Probably not strictly necessary to return tracklength.
        return this.tracks.length;
    };

    /**
     * Remove from tracklist by index
     * @param {number} trackNumber index to remove from
     * @returns {void}
     */
    remove = (trackNumber: number): void => {
        if (trackNumber < 0) return;

        // Get currently playing, if applicable
        let track: YouTubeVideo | undefined;
        if (this.trackAt !== 0) {
            track = this.tracks[this.trackAt - 1];
        }
        this.tracks.splice(trackNumber - 1, 1);

        // Update current track position, if applicable
        if (track) {
            this.trackAt = this.tracks.findIndex((t) => t.id === track?.id) + 1;
        }
    };

    // Returns track data - useful for some cases where context is required

    // Typescript transpiles funny if I use an arrow fn here...something about
    // calling super in an arrow fn is no gucci
    async playTrack(track: YouTubeVideo) {
        try {
            const audioResource = await createStream(track); // TODO: use this.quality
            console.debug('AudioResource', audioResource);
            super.play(audioResource);
        } catch (e) {
            console.error('Error playing track', e);
        }
        return track;
    }

    /**
     * Stops playback. Destroys current resource. Also indirectly starts idle timer again.
     * @param {boolean} force Force into idle state, override padding
     * @returns {boolean} True if the player comes to a stop, otherwise false
     */
    stop = (force?: boolean | undefined): boolean => {
        // TODO: this stops playback, but theoretically, there should be a resume?
        this.stopCalled = true;
        return super.stop(force);
    };

    // TODO: really need to create a type for Track...and fix it everywhere that touches .play()
    next = async (): Promise<YouTubeVideo | null> => {
        if (this.trackAt < this.tracks.length) this.trackAt += 1;
        else if (this.loopMode === LoopMode.ALL) this.trackAt = 1;
        else if (this.loopMode === LoopMode.OFF) return null;

        return this.playTrack(this.tracks[this.trackAt - 1]);
    };

    /**
     * Play previous track.
     * @returns Metadata for currently playing track
     */
    prev = async (): Promise<YouTubeVideo | null> => {
        if (this.trackAt <= 1) return null;

        this.trackAt -= 1;
        return this.playTrack(this.tracks[this.trackAt - 1]);
    };

    // Attempts to parse mode string
    setLoopMode = (mode: string) => {
        this.loopMode = (mode as LoopMode) || LoopMode.OFF;
    };

    /**
     * Adjust stream quality
     * @param {StreamQuality} quality stream quality
     */
    setQuality = (quality: StreamQuality) => {
        // TODO: maybe do some rounding or something
        // If we're accepting it as a command or userinput, maybe parse it there rather than here?
        if (!Number.isInteger(quality)) return;
        this.quality = quality;
    };

    /**
     * Start countdown to disconnect from voice.
     */
    setIdleTimeout = () => {
        if (!this.timeout) {
            this.stopCalled = false;
            this.timeout = setTimeout(() => {
                console.debug('Idle disconnect, goodbye!');
                this.disconnect();
            }, this.idleTimer);
        }
    };

    /**
     * Cancel idle disconnect countdown
     */
    clearTimeout = () => {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    };

    // === State change effects! ===

    private onPlay = (): void => {
        console.debug('Playing!');
        this.clearTimeout();
    };

    /**
     * Handles next track behavior
     */
    private onIdle = async (): Promise<void> => {
        console.log('noConnection', !this.connection);
        // bail early
        if (!this.connection || this.stopCalled) {
            this.setIdleTimeout();
            return;
        }

        let metadata;

        if (this.loopMode === LoopMode.CURRENT) {
            metadata = await this.playTrack(this.tracks[this.trackAt - 1]);
        } else {
            metadata = await this.next();
        }

        // TODO: update message in channel
        if (metadata) {
            console.log(`now playing ${metadata?.title}`);
            return;
        }

        this.setIdleTimeout();
    };

    /**
     * some stupid bs to make linter shut up about async fns
     */
    private onIdleWrapper = () => {
        this.onIdle()
            .then(() => {})
            .catch(() => {});
    };

    // These are probably useless. Can remove later, but need these for debugging atm

    // eslint-disable-next-line class-methods-use-this
    private onBuffering = (): void => {
        console.debug('Buffering!');
    };

    // eslint-disable-next-line class-methods-use-this
    private onAutoPause = (): void => {
        console.debug('AutoPause!');
    };

    // eslint-disable-next-line class-methods-use-this
    private onPause = (): void => {
        console.debug('Paused!');
    };
}
