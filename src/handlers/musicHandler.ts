/**
 * Responsible for creating and managing musicplayers per guild
 */

import { Collection } from 'discord.js';
import MusicPlayer from '../models/MusicPlayer';
import DiscordClient from '../models/client';

/**
 * MusicPlayer factory, returns a player instance (per guild) on request
 */
export default class MusicHandler extends Collection<string, MusicPlayer> {
    private readonly client: DiscordClient;

    constructor(client: DiscordClient) {
        super();
        this.client = client;
    }

    getOrCreate = (guildId: string): MusicPlayer =>
        this.get(guildId) ?? this.create(guildId);

    create = (guildId: string): MusicPlayer => {
        const player = new MusicPlayer(this.client, guildId);
        console.debug('Created new MusicPlayer!', player);
        this.set(guildId, player);
        return player;
    };
}
