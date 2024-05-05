import { CommandInteraction } from 'discord.js';
import Interaction from '../models/Interaction';

export default class Help extends Interaction<CommandInteraction> {
    name = 'help';

    description = 'Have you tried turning it off and on again?';

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        await interaction.editReply(
            "Help me, <@139955792093773825>, you're my only hope!",
        );
    };
}
