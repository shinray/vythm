import { Collection } from 'discord.js';
import { join } from 'path';
import DiscordClient from '../models/client';
import Event from '../models/Event';
import loadCommandModules from '../utils/loadCommandModules';

export default class EventHandler extends Collection<string, Event> {
    readonly client: DiscordClient;

    constructor(client: DiscordClient) {
        super();
        this.client = client;
        this.init();
    }

    private init = async () => {
        const folder = 'events';
        const path = join(__dirname, '..', folder);
        const files = loadCommandModules(path);
        console.debug('event modules', files);
        await Promise.all(
            files.map(async (file) => {
                const module = await import(file);
                const EventClass = module.default;
                console.debug('event module', EventClass);
                if (EventClass && EventClass.prototype instanceof Event) {
                    const event = new EventClass(this.client);
                    console.debug('event', event);
                    this.set(event.name, event);
                    this.client[event.once ? 'once' : 'on'](
                        event.name,
                        (...args: unknown[]) => event.execute(...args),
                    );
                } else {
                    console.error(`Error loading command ${file}`);
                }
            }),
        );
    };
}
