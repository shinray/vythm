import { CommandInteraction } from 'discord.js';
import Interaction from '../models/Interaction';

export default class Roll extends Interaction<CommandInteraction> {
    name = 'roll';

    description = 'roll a d20';

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        console.debug('play command received');
        const userId = `<@${interaction.user.id}>`;
        const d20: number = Math.floor(Math.random() * 20) + 1;
        let response = `${userId} rolled a d20 and got: ${d20}`;
        switch (d20) {
            case 20:
                response += '! NAT TWENTY!';
                break;
            case 1:
                response += '! CRITICAL FAILURE :<';
                response += '\n<@everyone> point and laugh!';
                break;
            default:
                response += '.';
                break;
        }
        console.debug(response);
        await interaction.editReply(response);
    };
}
