import { CommandInteraction } from 'discord.js';
import Interaction from '../../models/Interaction';

// TODO: placeholder
export default class Play extends Interaction {
    name = 'play';

    description = 'play with me';

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        console.debug('play command received');
        const userId = `<@${interaction.user.id}>`;
        const d20: number = Math.floor(Math.random() * 20) + 1;
        console.debug(`${userId} rolled a d20 and got: ${d20}`);
        return interaction.editReply(`${userId} rolled a d20 and got: ${d20}`);
    };
}
