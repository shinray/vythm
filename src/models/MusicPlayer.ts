// TODO: Need to find some kind of type that unifies yt, spotify, soundcloud, deezer...
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
    AudioPlayerState,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    VoiceConnection,
    joinVoiceChannel,
} from '@discordjs/voice';
import { TextChannel, VoiceChannel } from 'discord.js';
import { YouTubeVideo } from 'play-dl';
import DiscordClient from './client';
import { LoopMode } from '../types/LoopMode';
import { StreamQuality } from '../types/StreamQuality';
import { createStream } from '../utils/audio';

export default class MusicPlayer extends AudioPlayer {
    readonly client: DiscordClient;

    readonly guildId: string; // multiple discord support

    private lastKnownTextChannel: TextChannel | undefined; // text channel the bot talks in. going to assume to use the last textchannel that a command was issued from.

    private voiceChannelId: string | undefined;

    private connection: VoiceConnection | undefined;

    private _tracks: YouTubeVideo[] = [];

    public get tracks(): YouTubeVideo[] {
        return this._tracks;
    }

    // Track position index. One-based index, vs tracks[] zero-based
    private _trackAt: number = 0;

    public get trackAt(): number {
        return this._trackAt;
    }

    private loopMode: LoopMode = LoopMode.OFF;

    private quality: StreamQuality = StreamQuality.LOWEST;

    readonly idleTimer = 60000; // consider extracting to a constant or config file

    private stopCalled = false;

    private timeout: NodeJS.Timeout | undefined;

    constructor(client: DiscordClient, guildId: string) {
        super({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
        this.client = client;
        this.guildId = guildId;
        this.on(AudioPlayerStatus.Playing, () => this.onPlay());
        this.on(AudioPlayerStatus.Idle, this.onIdleWrapper); // handle song advance
        // Debug stuff, TODO: remove later.
        this.on(AudioPlayerStatus.Paused, () => this.onPause());
        this.on(AudioPlayerStatus.AutoPaused, () => this.onAutoPause());
        this.on(AudioPlayerStatus.Buffering, () => this.onBuffering());
    }

    /**
     * Commands instance to join a voice channel. Has idle timeout.
     * @param {VoiceChannel} voiceChannel Discord voice channel object
     * @param {TextChannel} textChannel Discord text channel object
     * @returns {void}
     */
    connect = (voiceChannel: VoiceChannel, textChannel?: TextChannel): void => {
        // Dedupe
        if (this.voiceChannelId === voiceChannel.id) return;
        this.voiceChannelId = voiceChannel.id;
        if (textChannel) this.lastKnownTextChannel = textChannel;
        this.connection = joinVoiceChannel({
            guildId: this.guildId,
            channelId: this.voiceChannelId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        this.connection.subscribe(this); // Can technically subscribe to multiple
        // connections at once, but that doesn't make sense in this context.
        // All connections would share the same audio. Would make more sense to have
        // multiple Players active instead.

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
     * Adds a track to the end of the play queue, and starts playback if idle
     * @param {YouTubeVideo[]} track Audio to be queued
     * @returns {number} length of queue (queue position)
     */
    add = async (track: YouTubeVideo[]): Promise<number> => {
        const prevTracksLength = this._tracks.length;
        this._tracks.push(...track);

        console.debug(
            'Player.Add! Current tracklist size',
            this._tracks.length,
        );

        const isNotPlaying =
            prevTracksLength === 0 || // queue was empty and we just pushed
            this.state.status === AudioPlayerStatus.Idle;
        if (isNotPlaying) {
            this._trackAt = prevTracksLength + 1;
            console.debug(`playing track ${track[0].title}`);
            await this.playTrack(track[0]);
        }

        // returns queue position
        return prevTracksLength + 1;
    };

    /**
     * Inserts a track into the play queue at a specified position. Does not affect playback.
     * @param {YouTubeVideo[]} track Audio to insert
     * @param {number} trackNumber index to insert into (one-indexed)
     */
    insert = (track: YouTubeVideo[], trackNumber: number) => {
        const adjustedTrackNumber = trackNumber - 1; // This function should accept the human-friendly index and compensate automatically.
        // handle negative floor
        if (adjustedTrackNumber < 0) {
            // Because we're unshift()ing, need to unshift in reverse order.
            track.reverse().forEach((t) => {
                this._tracks.unshift(t);
            });
            // Adjust positions
            if (this._trackAt !== 0) this._trackAt += track.length;
        }
        // handle positive ceiling.
        else if (adjustedTrackNumber >= this._tracks.length) {
            track.forEach((t) => {
                this._tracks.push(t);
            });
        }
        // Honestly, the above two cases are pretty unlikely. We shouldn't be too smart
        // about it and just let it happen.
        else {
            track.reverse().forEach((t) => {
                this._tracks.splice(adjustedTrackNumber, 0, t);
            });
            // Adjust positions
            if (this._trackAt >= trackNumber) this._trackAt += track.length;
        }
    };

    /**
     * Inserts track to play immediately after the current one.
     * When calling this, consider adding logic to immediately play if idle.
     * @param track track to insert immediately
     * @returns {number} next track position
     */
    insertNext = (track: YouTubeVideo[]): number => {
        // index is zero based, but conveniently, we want the next track anyway
        // so trackAt += 1; trackAt -=1, balances out
        this.insert(track, this._trackAt + 1);
        return this._trackAt + 1;
    };

    /**
     * Remove from tracklist by index
     * @param {number} trackNumber index to remove from
     * @returns {YouTubeVideo | null} track that was removed
     */
    remove = (trackNumber: number): YouTubeVideo | null => {
        const isInvalid =
            trackNumber < 0 || trackNumber - 1 > this._tracks.length;
        if (isInvalid) return null;

        // Get currently playing, if applicable
        let track: YouTubeVideo | undefined;
        if (this._trackAt !== 0) {
            track = this._tracks[this._trackAt - 1];
        }

        const removedTrack = this._tracks.splice(trackNumber - 1, 1);

        // Update current track position, if applicable
        if (track) {
            this._trackAt =
                this._tracks.findIndex((t) => t.id === track?.id) + 1;
        }

        return removedTrack.length > 0 ? removedTrack[0] : null;
    };

    // Returns track data - useful for some cases where context is required
    // Typescript transpiles funny if I use an arrow fn here...something about
    // calling super in an arrow fn is no gucci
    async playTrack(track: YouTubeVideo) {
        try {
            const audioResource = await createStream(track, {
                quality: this.quality,
            });
            console.debug('AudioResource', audioResource);
            super.play(audioResource);
        } catch (e) {
            console.error('Error playing track', e);
        }
        return track;
    }

    /**
     * Toggles pause status of the audio player instance
     * @returns {boolean} `true` if successfully paused/unpaused, otherwise `false`
     */
    pauseTrack = (): boolean => {
        const playerState: AudioPlayerState = this.state;
        console.debug(`Current player status: ${playerState.status}`);
        switch (playerState.status) {
            case AudioPlayerStatus.Playing:
                return super.pause();
            case AudioPlayerStatus.Paused: // ignore AutoPaused
                return super.unpause();
            default:
                return false;
        }
    };

    /**
     * Seeks within current track.
     */
    // eslint-disable-next-line class-methods-use-this
    seek = () => {
        // Did discordjs remove this functionality??
        throw new Error('Not implemented!');
    };

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
    /**
     * Advances track counter and plays immediately.
     * @returns {Promise<YouTubeVideo | null>} track metadata now playing, if applicable
     */
    next = async (): Promise<YouTubeVideo | null> => {
        // Advance track counter, or handle looping.
        if (this._trackAt < this._tracks.length) this._trackAt += 1;
        else if (this.loopMode === LoopMode.ALL) this._trackAt = 1;
        else if (this.loopMode === LoopMode.OFF) return null; // end of queue
        // TODO: should we replay final track, or stop, or do nothing?

        return this.playTrack(this._tracks[this._trackAt - 1]);
    };

    /**
     * Play previous track.
     * @returns Metadata for currently playing track
     */
    prev = async (): Promise<YouTubeVideo | null> => {
        if (this._trackAt <= 1) return null;

        this._trackAt -= 1;
        return this.playTrack(this._tracks[this._trackAt - 1]);
    };

    /**
     * Jump to a track and start playing immediately
     * @param {number} trackNumber position to jump to
     * @param {boolean} [force=false] force skip the current track
     * @returns {Promise<YouTubeVideo | null>} track metadata of nowplaying, if applicable
     */
    skip = async (
        trackNumber: number,
        force: boolean = false,
    ): Promise<YouTubeVideo | null> => {
        const isAlreadyPlaying = force
            ? false // short circuit if forcing skip
            : trackNumber === this._trackAt &&
              this.state.status === AudioPlayerStatus.Playing;
        const isInvalid =
            trackNumber < 1 ||
            trackNumber > this._tracks.length ||
            isAlreadyPlaying;
        if (isInvalid) return null;

        this._trackAt = trackNumber;
        return this.playTrack(this._tracks[this._trackAt - 1]);
    };

    /**
     * Shuffles the current tracklist
     * @returns {YouTubeVideo[]} the current playlist
     */
    shuffle = (): YouTubeVideo[] => {
        // Fisher-Yates algorithm
        for (let i = this._tracks.length - 1; i > 0; i -= 1) {
            // Generate a random index between 0 and i, inclusive
            const j = Math.floor(Math.random() * (i + 1));
            // Swap the elements at indices i and j
            [this._tracks[i], this._tracks[j]] = [
                this._tracks[j],
                this._tracks[i],
            ];
            // Update track index, if necessary
            if (this._trackAt === i + 1) {
                this._trackAt = j + 1;
            } else if (this._trackAt === j + 1) {
                this._trackAt = i + 1;
            }
        }
        return this._tracks;
    };

    /**
     * Clears the queue. Resets tracks and trackAt to initial value.
     * @returns {number} size of queue before purge
     */
    clear = (): number => {
        const queueLength = this._tracks.length;

        this._tracks = [];
        this._trackAt = 0;

        return queueLength;
    };

    // Attempts to parse mode string
    setLoopMode = (mode: string) => {
        this.loopMode = (mode as LoopMode) || LoopMode.OFF;
    };

    /**
     * Adjust stream quality
     * @param {StreamQuality} quality Stream quality: 0 - lowest, 1 - medium, 2 - highest
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
    setIdleTimeout = (): void => {
        // Reset timeout if already exists
        this.clearTimeout();
        // no longer need if check - we are certain that timeout is clear.
        this.stopCalled = false;
        this.timeout = setTimeout(() => {
            console.debug('Idle disconnect, goodbye!');
            this.disconnect();
        }, this.idleTimer);
    };

    /**
     * Cancel idle disconnect countdown
     */
    clearTimeout = (): void => {
        clearTimeout(this.timeout);
        this.timeout = undefined;
    };

    // === State change effects! ===

    /**
     * onPlay callback handler. Clears the idle timeout.
     */
    private onPlay = (): void => {
        console.debug('Playing!');
        this.clearTimeout();
    };

    /**
     * Handles next track behavior, or restarts idle timer.
     */
    private onIdle = async (): Promise<void> => {
        console.debug('Idle!');
        // bail early
        if (!this.connection || this.stopCalled) {
            this.setIdleTimeout();
            return;
        }

        // Continue queue
        let metadata;
        if (this.loopMode === LoopMode.CURRENT) {
            metadata = await this.playTrack(this._tracks[this._trackAt - 1]);
        } else {
            metadata = await this.next();
        }
        // TODO: update message in channel
        if (metadata) {
            console.log(`now playing ${metadata?.title}`);
            if (this.lastKnownTextChannel)
                await this.lastKnownTextChannel.send(
                    `now playing #${this._trackAt} - [${metadata?.title}](${metadata?.url})`,
                );
            return;
        }

        // Otherwise, restart idle countdown.
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
        // Note that this is only possible when noSubscriber behavior is set to
        // 'Pause' - meaning no active voice connections. Resumes when connection resumes
        console.debug('AutoPause!');
    };

    // eslint-disable-next-line class-methods-use-this
    private onPause = (): void => {
        console.debug('Paused!');
    };
}
