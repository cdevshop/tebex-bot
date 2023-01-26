const os = require("os");

exports.run = async(bot, message, args, color, prefix, config) => {
	const [freemem, totalmem] = [os.freemem(), os.totalmem()];
	return bot.util.embed(message, `🔸 Joined **${bot.guilds.cache.size}** servers
🔸 Cached **${bot.users.cache.size}** users
🔸 Uptime: **${bot.util.parseDur(bot.uptime)}**

🔸 Used RAM: **${((totalmem - freemem) / 1000000).toFixed(2)} MB**
🔸 Total RAM: **${(totalmem / 1000000).toFixed(2)} MB**`, "info");
};

exports.conf = {
	name:"stats",
	description: "Return bot statistics information",
	aliases: ["st", "info"],
	cooldown: 5,
	examples: [
		"stats"
	]
};