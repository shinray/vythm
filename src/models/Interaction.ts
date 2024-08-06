import {
    ApplicationCommandOptionBase,
    BaseInteraction,
    RESTPostAPIApplicationCommandsJSONBody,
    SlashCommandBuilder,
} from 'discord.js';
import DiscordClient from './client';

/**
 * All Interactions files should extend this class and implement name, description, execute
 * as a minimum.
 * Placing them in the appropriate folder will cause them to be picked up by the handler,
 * and the handler will always be initialized on application boot.
 * TODO: Should this be abstract?
 */
export default class Interaction<T extends BaseInteraction = BaseInteraction> {
    readonly client: DiscordClient;

    // TODO: should these options go in the constructor instead?
    name: string = '';

    description: string = 'No description provided.';

    options: ApplicationCommandOptionBase[] = [];

    dmPermission: boolean | undefined;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
    execute = async (interaction: T): Promise<void> => {
        console.error(
            `Attempted to call execute() on an Interaction with no implementation ${this.name}`,
        );
        throw new Error(`Unsupported operation ${this.name}.`);
    };

    constructor(client: DiscordClient) {
        this.client = client;
    }

    toJSON(): RESTPostAPIApplicationCommandsJSONBody {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);

        command.setDMPermission(this.dmPermission);

        this.options.forEach((option) => {
            command.options.push(option);
        });

        return command.toJSON();
    }
}
