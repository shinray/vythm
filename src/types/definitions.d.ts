import DiscordEvent from '../models/Event';
// Placeholder file for typescript definitions
export type EventConstructor<T extends DiscordEvent> = new (
    client: DiscordClient,
) => T;
