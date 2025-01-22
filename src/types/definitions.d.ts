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

export interface VythmConfig {
    token: string;
    clientId: string;
    guildId: string;
}
