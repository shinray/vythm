import DiscordClient from './client';

/**
 * Class representing any Discord event.
 */
export default class DiscordEvent {
    readonly client: DiscordClient;

    name: string = '';

    once: boolean = false;

    /**
     * Handler that processes effects for this given event.
     * @param _args Arguments to pass to script.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute = (..._args: unknown[]): Promise<void> => {
        console.error(
            `Attempted to call execute() on an Event with no implementation ${this.name}`,
        );
        throw new Error(`Unsupported event ${this.name}.`);
    };

    constructor(client: DiscordClient) {
        this.client = client;
    }
}
