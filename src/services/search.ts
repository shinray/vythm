// parent search. holds logic for splitting between different services

import * as play from 'play-dl';
import { PlayValidation } from '../types/definitions';

// TODO: handle search for other sources. for now, default to yt_videos only
export const search = async (
    query: string,
): Promise<play.YouTubeVideo | null> => {
    const validationResult: PlayValidation = await play.validate(query);

    if (validationResult === 'search') {
        const searchResult = await play.search(query, {
            source: { youtube: 'video' },
            limit: 1,
        });

        if (searchResult.length === 0) return null;

        return searchResult[0];
    }

    if (validationResult === 'yt_video') {
        const { video_details } = await play.video_basic_info(query);
        return video_details;
    }

    return null;
};
