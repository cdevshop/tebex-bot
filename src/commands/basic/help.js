const { EmbedBuilder } = require("discord.js");

exports.run = async(bot, message, args, color, prefix, config) => {
	let modules = bot.helps;
	if(!config.DEVELOPERS.includes(message.author.id)) modules = bot.helps.filter(x => !x.hide);

	const embed = new EmbedBuilder()
	.setColor(color.info)
	.setTitle("Commands");

	let fields = [];
	for (const mod of modules) {
		fields.push({ name: mod[1].name, value: mod[1].cmds.map(x => `\`${x}\``).join(" ") });
	};

	embed.addFields(fields);
	return message.reply({ embeds: [embed] });
};

exports.conf = {
	name: "help",
	description: "Return list of available commands",
	aliases: ["h"],
	cooldown: 5,
	examples: [
		"help"
	]
};
