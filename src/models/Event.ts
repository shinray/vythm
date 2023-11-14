import DiscordClient from './client';

export default class DiscordEvent {
    readonly client: DiscordClient;

    name: string = '';

    once: boolean = false;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute = (..._args: unknown[]) => {
        console.error(
            `Attempted to call execute() on an Event with no implementation ${this.name}`,
        );
        throw new Error(`Unsupported event ${this.name}.`);
    };

    constructor(client: DiscordClient) {
        this.client = client;
    }
}
