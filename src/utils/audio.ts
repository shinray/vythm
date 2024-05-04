/* eslint @typescript-eslint/no-explicit-any: "warn" */
/* eslint @typescript-eslint/no-redundant-type-constituents: "warn" */
/* eslint @typescript-eslint/no-unsafe-member-access: "warn" */
/* eslint @typescript-eslint/no-unsafe-argument: "warn" */
/* eslint @typescript-eslint/no-unsafe-assignment: "warn" */
// TODO: fix typescript explicit any. Right now, we're only expecting youtube urls...
// in fact, try and genericize this such that it accepts all the types play-dl supports...
// TODO: createAudioResource - play stream and wrap in createAudioResource
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
    metadata: play.YouTubeVideo | any,
    options?: StreamOptions,
): Promise<AudioResource<any>> => {
    console.debug('Create Stream!', metadata?.url);
    const streamOptions = options || {
        quality: StreamQuality.lowest,
    };
    const { stream, type } = await play.stream(metadata.url, streamOptions);

    return createAudioResource(stream, { inputType: type, metadata });
};
