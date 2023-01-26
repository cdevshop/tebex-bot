require("dotenv").config();

const TebexBot = require("./handle/TebexBot");
const { GatewayIntentBits } = require("discord.js");
const client = new TebexBot({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	],
	allowedMentions: { parse: ["users"], repliedUser: false },
	partials: ['MESSAGE', 'CHANNEL', 'GUILD_MEMBER', 'USER']
});

require("./handle/events")(client);
require("./handle/module")(client);

client.login(process.env.BOT_TOKEN)
.catch(console.error);