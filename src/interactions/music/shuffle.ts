import { CommandInteraction, SlashCommandBooleanOption } from 'discord.js';
import { useQueue } from 'discord-player';
import Interaction from '../../models/Interaction';

export default class Shuffle extends Interaction<CommandInteraction> {
    name = 'shuffle';

    description = 'Toggles shuffling. Takes effect when current track ends.';

    options = [
        new SlashCommandBooleanOption()
            .setName('dynamic')
            .setDescription(
                'Default on. Shuffle when current track ends, without mutating. If off, will mutate entire queue.',
            )
            .setRequired(false),
    ];

    // eslint-disable-next-line class-methods-use-this
    execute = async (interaction: CommandInteraction) => {
        const queue = useQueue(interaction.guild!);
        const queueLength = queue?.getSize() || 0;

        if (!queue || queueLength < 2) {
            await interaction.editReply('Queue is too small to shuffle!');
            return;
        }

        const dynamicMode =
            (interaction.options.get('dynamic', false)?.value as
                | boolean
                | undefined) ?? true;

        queue.toggleShuffle(dynamicMode);

        let message = `Toggled shuffle mode to ${queue.isShuffling}.`;
        if (!dynamicMode) {
            message += `\nShuffled ${queue.size} tracks in-place!`;
        }

        await interaction.editReply(message);
    };
}
