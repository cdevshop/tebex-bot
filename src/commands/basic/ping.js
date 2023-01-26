exports.run = async (bot, message, args, color, prefix, config) => {
	return bot.util.embed(message, `🏓 **Pong!** \`${bot.ws.ping}ms\``, "success");
};

exports.conf = {
	name: "ping",
	description: "Ping pong!",
	aliases: ["ping"],
	cooldown: 5,
	examples: [
		"ping"
	]
};