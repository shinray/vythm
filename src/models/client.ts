import { Client, GatewayIntentBits } from 'discord.js';
import configJson from '../config.json';
import InteractionHandler from '../handlers/interactionHandler';
import EventHandler from '../handlers/eventHandler';
// import MusicHandler from '../handlers/musicHandler';
import { VythmConfig } from '../types/definitions';

export default class DiscordClient extends Client {
    private config: VythmConfig = configJson;

    public caches = {};

    // client Ready event will actually initialize and register everything.
    public events = new EventHandler(this);

    public interactions = new InteractionHandler(this);

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildVoiceStates,
            ],
        });

        this.init();
    }

    private init = () => {
        const { token } = this.config;
        this.events
            .init()
            .then(() => {
                console.debug('Initialized EventHandler');
            })
            .catch((error) => {
                console.error(
                    '\x1b[31m%s\x1b[0m',
                    'Error initializing EventHandler',
                    error,
                );
            });
        this.interactions
            .init()
            .then(() => {
                console.debug('Initialized InteractionHandler');
            })
            .catch((error) => {
                console.error(
                    '\x1b[31m%s\x1b[0m',
                    'Error initializing InteractionHandler',
                    error,
                );
            });
        this.login(token)
            .then(() => {
                console.log('Login successful.');
            })
            .catch((error) => {
                console.error(
                    '\x1b[31m%s\x1b[0m',
                    'Error on client login: ',
                    error,
                );
            });
    };
}
