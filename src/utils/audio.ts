// TODO: createAudioResource - play stream and wrap in createAudioResource
// takes URL and quality
import * as play from 'play-dl';
import { AudioResource, createAudioResource } from '@discordjs/voice';
import { StreamOptions, StreamQuality, Track } from '../types/definitions';

/**
 * Creates an audio resource and neatly packages things for AudioPlayer
 * @param {string} url Youtube or Soundcloud URL
 * @param {StreamOptions} options optional options object
 * @returns AudioResource object
 */
export const createStream = async (
    metadata: play.YouTubeVideo | any,
    options?: StreamOptions,
): Promise<AudioResource<any>> => {
    const streamOptions = options || {
        quality: StreamQuality.lowest,
    };
    const { stream, type } = await play.stream(metadata.url, streamOptions);

    return createAudioResource(stream, { inputType: type, metadata });
};
