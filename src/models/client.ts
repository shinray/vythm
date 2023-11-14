import { Client, GatewayIntentBits } from 'discord.js';
import config from '../config.json';
import InteractionHandler from '../handlers/interactionHandler';
import EventHandler from '../handlers/eventHandler';

export default class DiscordClient extends Client {
    public caches = {};

    // client Ready event will actually initialize and register everything.
    public events = new EventHandler(this);

    public interactions = new InteractionHandler(this);

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                // GatewayIntentBits.GuildMessages,
                // GatewayIntentBits.GuildPresences,
                // GatewayIntentBits.GuildVoiceStates,
            ],
        });

        this.init();
    }

    private init = () => {
        this.login(config.token)
            .then(() => {
                console.log('Login successful.');
            })
            .catch((error) => {
                console.error('Error on client login: ', error);
            });
    };
}
