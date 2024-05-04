import { Collection, REST, Routes } from 'discord.js';
import { join } from 'path';
import DiscordClient from '../models/client';
import Interaction from '../models/Interaction';
import loadCommandModules from '../utils/loadCommandModules';
import configJson from '../config.json';
import { InteractionConstructor, VythmConfig } from '../types/definitions';

/**
 * Registers Interactions that the bot will handle. (slash commands)
 * Also is capable of pushing Interactions to Discord API.
 */
export default class InteractionHandler extends Collection<
    string,
    Interaction
> {
    client: DiscordClient;

    constructor(client: DiscordClient) {
        super();
        this.client = client;
    }

    /**
     * Reads folder and loads Interactions.
     */
    init = async () => {
        const folder = 'interactions';
        const path = join(__dirname, '..', folder);
        const files = loadCommandModules(path);
        console.debug('Discovered interaction modules', files);

        await Promise.all(
            files.map(async (file) => {
                const module = (await import(file)) as {
                    default: InteractionConstructor<Interaction>;
                };
                const InteractionClass = module.default;
                if (
                    InteractionClass &&
                    InteractionClass.prototype instanceof Interaction
                ) {
                    const command = new InteractionClass(this.client);
                    console.debug(`loading command module ${command.name}...`);
                    this.set(command.name, command);
                } else {
                    console.error(`Error loading command module ${file}`);
                }
            }),
        );
    };

    /**
     * Publish all currently registered commands to Discord API.
     * This is what allows Discord to describe slash commands to the user.
     */
    deploy = async () => {
        const config: VythmConfig = configJson;
        const { token, clientId, guildId } = config;
        // TODO: make api call to register all commands
        // registerCommands(this);
        const body = this.map((c) => c.toJSON());
        const rest = new REST().setToken(token);
        try {
            console.log(`Publishing ${this.size} commands to Discord API...`);
            this.map((i) => console.debug(`--Publishing ${i.name}`));
            // TODO: Something weird happened here as of May 2024. Needed to switch to
            // pushing Guild commands...now commands are duplicated. Must investigate.
            const response = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                {
                    body,
                },
            );
            console.debug('Discord publish API response', response);
        } catch (e) {
            console.error('Error registering commands to API ', e);
        }
    };
}
