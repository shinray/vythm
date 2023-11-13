import { REST, Routes } from 'discord.js';
import config from '../config.json';

// TODO: implement version that refreshes on a per-guild basis.
// Arguably useless since this bot should not be widely distributed.
const registerCommands = async (commands) => {
    const body = commands.map((c) => c.toJSON());
    const rest = new REST().setToken(config.token);
    const { clientId } = config;

    try {
        console.log(`Publishing ${commands.length} commands to Discord`);
        rest.put(Routes.applicationCommands(clientId), {
            body,
        });
    } catch (e) {
        console.error('Error registering commands to API ', e);
    }
};

export default registerCommands;
