// parent search. holds logic for splitting between different services

import * as play from 'play-dl';
import { PlayValidation } from '../types/definitions';

// TODO: handle search for other sources. for now, default to yt_videos only
export const search = async (query: string): Promise<play.YouTubeVideo[]> => {
    const validationResult: PlayValidation = await play.validate(query);

    switch (validationResult) {
        case 'search': {
            const searchResult = await play.search(query, {
                source: { youtube: 'video' },
                limit: 1,
            });
            return searchResult ?? [];
        }
        case 'yt_video': {
            const { video_details } = await play.video_basic_info(query);
            return [video_details];
        }
        case 'yt_playlist': {
            const playlist = await play.playlist_info(query);
            const videolist = await playlist.all_videos();
            return videolist ?? [];
        }
        case 'dz_album':
        case 'dz_playlist':
        case 'dz_track':
        case 'so_playlist':
        case 'so_track':
        case 'sp_album':
        case 'sp_playlist':
        case 'sp_track':
            throw new Error(
                `Sorry, we don't currently support type: ${validationResult}! Come back later!`,
            );
        default:
            return [];
    }
};
