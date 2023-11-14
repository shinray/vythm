import DiscordEvent from '../models/Event';
import DiscordClient from '../models/client';
// Placeholder file for typescript definitions
export type EventConstructor<T extends DiscordEvent> = new (
    client: DiscordClient,
) => T;

export type InteractionConstructor<T extends Interaction> = new (
    client: DiscordClient,
) => T;
