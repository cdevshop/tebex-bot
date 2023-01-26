const { Events, ActivityType, MessageEmbed } = require("discord.js");

exports.info = {
	name: Events.MessageCreate,
	once: false
};

exports.run = async(client, message, config) => {
	if(message.author.bot || !message.guild) return;

	const msg = message.content.toLowerCase();
	const prefix = await client.db.get(`prefix.${message.guild.id}`) ?? config.PREFIX;

	if(msg.startsWith(prefix)) {
		try {
			require("../handle/command")(client, message);
		} catch (e) {
			console.error(e);
		};
	};

	if(msg === `<@${client.user.id}>` || msg === `<@!${client.user.id}>`) {
		return client.util.embed(message, `Prefix: **${prefix}**`, "info");
	}
};
