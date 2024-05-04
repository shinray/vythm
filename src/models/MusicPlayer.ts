/* eslint @typescript-eslint/no-unsafe-return: "warn" */
/* eslint @typescript-eslint/no-unsafe-member-access: "warn" */
/* eslint @typescript-eslint/no-unsafe-assignment: "warn" */
/* eslint @typescript-eslint/no-explicit-any: "warn" */
/* eslint @typescript-eslint/require-await: "warn" */
/* eslint class-methods-use-this: "warn" */
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
import { LoopMode } from '../types/definitions';
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
        this.on(AudioPlayerStatus.Playing, () => this.onPlay());
        this.on(AudioPlayerStatus.Idle, () => this.onIdle()); // handle song advance
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

        console.debug('Player.Add! Current tracklist size', this.tracks.length);
        // If we're not playing anything, start playing.
        if (
            this.tracks.length === 1 ||
            this.state.status === AudioPlayerStatus.Idle
        ) {
            this.trackAt = this.tracks.length;
            console.debug(`playing track ${track.title}`);
            await this.play(track);
        }

        // Probably not strictly necessary to return tracklength.
        return this.tracks.length;
    };

    remove = (trackNumber: number) => {
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
    // play = async (track: YouTubeVideo) => {
    // play = async (track: any) => {
    //     const audioResource = await createStream(track);
    //     console.debug('AudioResource', audioResource);
    //     try {
    //         super.play(audioResource);
    //     } catch (e) {
    //         console.error('Error playing track', e);
    //     }
    //     // const audioPlayerPlay = Object.getPrototypeOf(
    //     //     Object.getPrototypeOf(this),
    //     // ).play;
    //     // console.debug('Track!', track);
    //     // audioPlayerPlay.call(this, await createStream(track));
    //     // super.play.call(this, await createStream(track));
    //     return track;
    // };

    // Typescript transpiles funny if I use an arrow fn here...something about
    // calling super in an arrow fn is no gucci
    async play(track: any) {
        const audioResource = await createStream(track);
        console.debug('AudioResource', audioResource);
        try {
            super.play(audioResource);
        } catch (e) {
            console.error('Error playing track', e);
        }
    }

    stop = (force?: boolean | undefined): boolean => {
        this.stopCalled = true;
        return super.stop(force);
    };

    next = () => {
        throw new Error('Not implemented!');
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
            this.timeout = setTimeout(() => {
                console.debug('Idle disconnect, goodbye!');
                this.disconnect();
            }, this.idleTimer);
        }
    };

    clearTimeout = () => {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    };

    onPlay = (): void => {
        console.debug('Playing!');
        this.clearTimeout();
    };

    onIdle = (): void => {
        // TODO: advance to next audio in queue
        console.log('noConnection', !this.connection);
        // eslint-disable-next-line no-useless-return
        if (!this.connection) return;
        // throw new Error('Method not implemented.');
    };

    // eslint-disable-next-line class-methods-use-this
    onBuffering = (): void => {
        console.debug('Buffering!');
    };

    // eslint-disable-next-line class-methods-use-this
    onAutoPause = (): void => {
        console.debug('AutoPause!');
    };

    // eslint-disable-next-line class-methods-use-this
    onPause = (): void => {
        console.debug('Paused!');
    };
}
