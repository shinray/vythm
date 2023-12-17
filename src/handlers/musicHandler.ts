/**
 * Responsible for creating and managing musicplayers per guild
 */

import { Collection } from 'discord.js';
import MusicPlayer from '../models/MusicPlayer';
import DiscordClient from '../models/client';

export default class MusicHandler extends Collection<string, MusicPlayer> {
    readonly client: DiscordClient;

    constructor(client: DiscordClient) {
        super();
        this.client = client;
    }

    getOrCreate = (guildId: string): MusicPlayer =>
        this.get(guildId) ?? this.create(guildId);

    create = (guildId: string): MusicPlayer => {
        const player = new MusicPlayer(this.client, guildId);
        this.set(guildId, player);
        return player;
    };
}
