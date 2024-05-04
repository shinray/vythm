import * as play from 'play-dl';
import DiscordEvent from '../models/Event';
import DiscordClient from '../models/client';
import { StreamQuality } from './StreamQuality';
// Placeholder file for typescript definitions
export type EventConstructor<T extends DiscordEvent> = new (
    client: DiscordClient,
) => T;

export type InteractionConstructor<T extends Interaction> = new (
    client: DiscordClient,
) => T;

export type LoopMode = 'off' | 'current' | 'all';

export interface StreamOptions {
    seek?: number;
    quality?: StreamQuality;
    language?: string;
    htmldata?: boolean;
    precache?: number;
    discordPlayerCompatibility?: boolean;
}

export type PlayValidation =
    | 'so_playlist'
    | 'so_track'
    | 'sp_track'
    | 'sp_album'
    | 'sp_playlist'
    | 'dz_track'
    | 'dz_playlist'
    | 'dz_album'
    | 'yt_video'
    | 'yt_playlist'
    | 'search'
    | false;

// This is probably a terrible idea and I will definitely regret this in the future
export interface Track extends play.YouTubeVideo {
    trackType: string;
}
