import { Client, Events, GatewayIntentBits } from "discord.js";
import config from "./config.json";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`Client ready, logging in as ${c.user.tag}`);
});

client.login(config.token);

  // test change
