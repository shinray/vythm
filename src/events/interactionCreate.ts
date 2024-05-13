import { Events, Interaction } from 'discord.js';
import DiscordEvent from '../models/Event';

/**
 * Script for handling InteractionCreate Event. AKA slash commands.
 */
export default class InteractionCreate extends DiscordEvent {
    name = Events.InteractionCreate;

    execute = async (...args: unknown[]) => {
        const interaction = args[0] as Interaction;
        if (!interaction.isChatInputCommand()) return;

        await interaction.deferReply();
        const command = this.client.interactions.get(interaction.commandName);
        await command!.execute(interaction);
    };
}
