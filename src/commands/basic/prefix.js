exports.run = async(bot, message, args, color, prefix, config) => {
	if(!message.member.permissions.has("MANAGE_GUILD")) return;

	const newPrefix = args.join(" ");
	if(!newPrefix) return bot.util.embed(message, "You have to include the new prefix too!", "cmd", "prefix");
	if(newPrefix === prefix) return bot.util.embed(message, "That is the current prefix...", "error");

	await bot.db.set(`prefix.${message.guild.id}`. newPrefix);
	return bot.util.embed(message, `Prefix changed to ${newPrefix}`, "success");
};

exports.conf = {
	name: "prefix",
	description: "Change the bot prefix. Need `Manage Server` permission",
	aliases: ["setprefix", "pref"],
	cooldown: 5,
	examples: [
		"prefix t!",
		"setprefix ./"
	]
};