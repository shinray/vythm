import { Interaction } from 'discord.js';
import Event from '../models/Event';

export default class InteractionCreate extends Event {
    name = 'interactionCreate';

    execute = async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        await interaction.deferReply();
        const command = this.client.interactions.get(interaction.commandName);
        return command!.execute(interaction);
    };
}
