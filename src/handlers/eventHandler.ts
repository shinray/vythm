import { Collection } from 'discord.js';
import { join } from 'path';
import DiscordClient from '../models/client';
import DiscordEvent from '../models/Event';
import loadCommandModules from '../utils/loadCommandModules';
import type { EventConstructor } from '../types/definitions';

/**
 * Registers Events that the bot will handle.
 */
export default class EventHandler extends Collection<string, DiscordEvent> {
    readonly client: DiscordClient;

    constructor(client: DiscordClient) {
        super();
        this.client = client;
    }

    /**
     * Reads folder and loads Events.
     */
    init = async () => {
        const folder = 'events';
        const path = join(__dirname, '..', folder);
        const files = loadCommandModules(path);
        console.debug('Discovered event modules', files);
        await Promise.all(
            files.map(async (file) => {
                const module = (await import(file)) as {
                    default: EventConstructor<DiscordEvent>;
                };
                const EventClass = module.default;
                if (
                    EventClass &&
                    EventClass.prototype instanceof DiscordEvent
                ) {
                    const event = new EventClass(this.client);
                    console.debug(`loading event module ${event.name}...`);
                    this.set(event.name, event);
                    // Choose between this.client.once() and this.client.on()
                    // Register a callback to happen based on event.name
                    this.client[event.once ? 'once' : 'on'](
                        event.name,
                        (...args: unknown[]) => event.execute(...args),
                    );
                } else {
                    console.error(`Error loading event ${file}`);
                }
            }),
        );
    };
}
