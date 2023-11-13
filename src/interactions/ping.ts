import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import Interaction from '../models/Interaction';

// const data = new SlashCommandBuilder()
//     .setName('ping')
//     .setDescription('Replies with Pong!');

// const execute = async (interaction) => {
//     console.debug('ping received ', interaction);
//     try {
//         await interaction.reply('Pong!');
//     } catch (e) {
//         console.error('ping reply error ', e);
//     }
// };

// export { data, execute };

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
