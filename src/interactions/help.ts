import { CommandInteraction } from 'discord.js';
import Interaction from '../models/Interaction';

export default class Help extends Interaction<CommandInteraction> {
    name = 'help';

    description = 'Quickstart guide to commands';

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        console.debug('help command received');
        await interaction.editReply('Coming soon!');
    };
}
