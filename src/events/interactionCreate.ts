import { Interaction } from 'discord.js';
import DiscordEvent from '../models/Event';

export default class InteractionCreate extends DiscordEvent {
    name = 'interactionCreate';

    execute = async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        await interaction.deferReply();
        const command = this.client.interactions.get(interaction.commandName);
        command!.execute(interaction);
    };
}
