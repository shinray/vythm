import { ActivityType } from 'discord.js';
import DiscordClient from '../models/client';
import DiscordEvent from '../models/Event';

export default class Ready extends DiscordEvent {
    name = 'ready';

    once = true;

    // eslint-disable-next-line class-methods-use-this
    execute = async (...args: unknown[]): Promise<void> => {
        const client = args[0] as DiscordClient;
        // Push command list to Discord API
        await client.interactions.deploy();
        client.user?.setPresence({
            status: 'online',
            activities: [
                {
                    name: '/help',
                    type: ActivityType.Listening,
                },
            ],
        });

        console.log(`${client.user?.tag} reporting.`);
    };
}
