import {
    REST,
    Routes,
    Client,
    Collection,
    Events,
    GatewayIntentBits,
} from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import config from './config.json';
import DiscordClient from './models/client';

// const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const client = new DiscordClient();

// TODO: implement interaction handler
// client.commands = new Collection();

// const commandList = [];
// const loadModules = async () => {
//     try {
//         const commandsPath = path.join(__dirname, 'commands');
//         const readCommandDir = await fs.readdir(commandsPath);
//         // filter by .js files, since we transpile to .js
//         const commandFiles = readCommandDir.filter((file) =>
//             file.endsWith('.js'),
//         );
//         const importPromises = commandFiles.map(
//             (file) => import(path.join(commandsPath, file)),
//         );
//         const commands = await Promise.all(importPromises);
//         commands.forEach((command) => {
//             if ('data' in command && 'execute' in command) {
//                 // console.debug('in');
//                 client.commands.set(command.data.name, command);
//                 commandList.push(command.data.toJSON());
//             } else {
//                 console.log('oops');
//                 // console.warn(`[WARNING] The command at ${command.}`)
//             }
//         });
//     } catch (error) {
//         console.error('Error loading command modules', error);
//     }

//     // Construct and prepare an instance of the REST module
//     const rest = new REST().setToken(config.token);

//     // and deploy your commands!
//     try {
//         console.log(
//             `Started refreshing ${commandList.length} application (/) commands.`,
//         );
//         console.log('commandList', commandList);

//         // The put method is used to fully refresh all commands in the guild with the current set
//         const data = await rest.put(
//             Routes.applicationCommands(config.clientId),
//             {
//                 body: commandList,
//             },
//         );

//         console.log(
//             `Successfully reloaded ${data.length} application (/) commands.`,
//         );
//     } catch (error) {
//         // And of course, make sure you catch and log any errors!
//         console.error(error);
//     }
// };

// loadModules();

client.once(Events.ClientReady, async (c) => {
    await client.interactions.deploy();
    console.log(`Client ready, logging in as ${c.user.tag}`);
    // console.debug('client interactions', client.interactions);
    // console.debug('client commands', client.commands)
});
client.on(Events.InteractionCreate, async (interaction) => {
    console.debug('commandName', interaction.commandName);
    console.debug('client commands', interaction.client.commands);
});

// TODO: as above, move all this into a handler file
// client.on(Events.InteractionCreate, async (interaction) => {
//     if (!interaction.isChatInputCommand()) return;
//     const command = interaction.client.commands.get(interaction.commandName);

//     if (!command) {
//         console.error(
//             `No command matching ${interaction.commandName} was found.`,
//         );
//         return;
//     }

//     try {
//         await command.execute(interaction);
//     } catch (error) {
//         console.error(error);
//         if (interaction.replied || interaction.deferred) {
//             await interaction.followUp({
//                 content: 'There was an error while executing this command!',
//                 ephemeral: true,
//             });
//         } else {
//             await interaction.reply({
//                 content: 'There was an error while executing this command!',
//                 ephemeral: true,
//             });
//         }
//     }
// });

// client.login(config.token);
