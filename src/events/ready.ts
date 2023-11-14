import { ActivityType } from 'discord.js';
import DiscordClient from '../models/client';
import Event from '../models/Event';

export default class Ready extends Event {
    name = 'ready';

    once = true;

    execute = async (client: DiscordClient): Promise<void> => {
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
