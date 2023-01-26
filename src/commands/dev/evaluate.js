const Discord = require("discord.js");
const { EmbedBuilder } = Discord;

const { QuickDB } = require("quick.db");
const db = new QuickDB({ table: "DB" });
const fetch = require("node-fetch");
const fs = require("fs");

exports.run = async (client, message, args, color, prefix, config) => {
	if(!config.DEVELOPERS.includes(message.author.id)) return;

	var bot = client;
	var msg = message;

	var embed = new EmbedBuilder()
	.setColor(color.success);

	try {
		var code = args.join(" ");
		let evaled = await eval(code);
		evaled = evaled.replace(bot.token, "nuts!")

		if(typeof evaled !== "string") evaled = require("util").inspect(evaled, { depth: 0 } );

		const output = clean(evaled);
		if(output.length > 1024) {
			embed.setDescription(output.slice(0, 1024));
		} else {
			embed.setDescription('```js\n' + output + '```');
		};

		message.reply({ embeds: [embed] });
	} catch (e) {
		embed.setColor(color.error);

		const error = clean(e);
		if(error.length > 1024) {
			embed.setDescription(error.slice(0, 1024));
		} else {
			embed.setDescription('```js\n' + error + '```');
		};

		message.reply({ embeds: [embed] });
	};
};

function clean(text) {
	if (typeof(text) === "string") {
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	} else {
		return text;
	}
};

exports.conf = {
	name: "evaluate",
	description: "Execute javascript code",
	aliases: ["ev", "eval"],
	cooldown: 0.5,
	examples: [
		"console.log('your mom')",
		" 60 + 9"
	]
};