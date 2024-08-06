// TODO: create a unified type to support more than YT videos...
// in fact, try and genericize this such that it accepts all the types play-dl supports...
// takes URL and quality

import * as play from 'play-dl';
import { AudioResource, createAudioResource } from '@discordjs/voice';
import { StreamOptions } from '../types/definitions';
import { StreamQuality } from '../types/StreamQuality';

/**
 * Creates an audio resource and neatly packages things for AudioPlayer
 * @param {play.YouTubeVideo} metadata Youtube or Soundcloud URL
 * @param {StreamOptions} options optional options object
 * @returns AudioResource object
 */
export const createStream = async (
    metadata: play.YouTubeVideo,
    options: StreamOptions = { quality: StreamQuality.LOWEST },
): Promise<AudioResource<play.YouTubeVideo>> => {
    const streamOptions = options;
    const { stream, type } = await play.stream(metadata.url, streamOptions);

    return createAudioResource(stream, { inputType: type, metadata });
};
