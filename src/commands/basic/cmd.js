const { EmbedBuilder } = require("discord.js");

exports.run = async(bot, message, args, color, prefix, config) => {
	let modules = bot.helps;

	let rawCmd = args[0];
	if(!rawCmd) return bot.util.embed(message, "You need to include the command name", "cmd", "cmd");
	rawCmd = rawCmd.toLowerCase();

	if(bot.commands.has(rawCmd)) {
		rawCmd = bot.commands.get(rawCmd);
	} else if(bot.aliases.has(rawCmd)) {
		rawCmd = bot.commands.get(bot.aliases.get(rawCmd));
	} else {
		rawCmd = null;
	};

	if(!rawCmd) return bot.util.embed(message, "Command not found", "error");
	const cmd = rawCmd.conf;
	if(cmd.slash) prefix = "/";

	const aliases = cmd.aliases ? cmd.aliases.join("`, `") : "No alias"
	const embed = new EmbedBuilder()
	.setColor(color.info)
	.setTitle(`${cmd.name} command`)
	.setDescription(cmd.description ?? "No description :(")
	.addFields([
		{ name: "Cooldown", value: `${cmd.cooldown} second(s)`, inline: true },
		{ name: "Alias", value: `\`${aliases}\``, inline: true },
		{ name: "Examples", value: `\`${prefix}${cmd.examples.join(`\`\n\`${prefix}`)}\`` }
	]);
	return message.reply({ embeds: [embed] });
};

exports.conf = {
	name: "cmd",
	description: "Return information about the comamnd",
	aliases: ["cmd"],
	cooldown: 5,
	examples: [
		"cmd ping",
		"cmd stats"
	]
};
