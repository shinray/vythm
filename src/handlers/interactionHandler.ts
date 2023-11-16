import { Collection, REST, Routes } from 'discord.js';
import { join } from 'path';
import DiscordClient from '../models/client';
import Interaction from '../models/Interaction';
import loadCommandModules from '../utils/loadCommandModules';
import config from '../config.json';
import { InteractionConstructor } from '../types/definitions';

export default class InteractionHandler extends Collection<
    string,
    Interaction
> {
    client: DiscordClient;

    constructor(client: DiscordClient) {
        super();
        this.client = client;
    }

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

    deploy = async () => {
        // TODO: make api call to register all commands
        // registerCommands(this);
        const body = this.map((c) => c.toJSON());
        const rest = new REST().setToken(config.token);
        const { clientId } = config;

        try {
            console.log(`Publishing ${this.size} commands to Discord API...`);
            this.map((i) => console.debug(`--Publishing ${i.name}`));
            await rest.put(Routes.applicationCommands(clientId), {
                body,
            });
        } catch (e) {
            console.error('Error registering commands to API ', e);
        }
    };
}
