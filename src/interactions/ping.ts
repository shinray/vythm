import { CommandInteraction } from 'discord.js';
import Interaction from '../models/Interaction';

export default class Ping extends Interaction {
    name = 'ping';

    description = 'Replies with Pong!';

    execute = async (interaction: CommandInteraction) => {
        console.debug('ping command received');
        const execTime = Math.abs(Date.now() - interaction.createdTimestamp);
        const apiLatency = Math.floor(this.client.ws.ping);
        console.debug('execTime', execTime, 'apiLatency', apiLatency);
        return interaction.editReply(
            `Execution time: ${execTime}ms, API latency: ${apiLatency}ms`,
        );
    };
}
