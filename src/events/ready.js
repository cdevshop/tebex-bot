const { Events, ActivityType } = require("discord.js");

exports.info = {
	name: Events.ClientReady,
	once: true
};

exports.run = async (client, bot, config) => {
	for(var i of client.guilds.cache) {
		await i[1].members.fetch();
	};

	client.user.setActivity("tebex.io", { type: ActivityType.Watching });
	console.log(`${client.user.tag} Online`);
};