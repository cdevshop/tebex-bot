const config = require("../storage/config.json");
const Discord = require('discord.js');
const { Collection, EmbedBuilder } = Discord;
const cooldowns = new Collection();

module.exports = async (client, message) => {
	const wait = ms => new Promise(r => setTimeout(r, ms));
	const prefix = await client.db.get(`prefix.${message.guild.id}`) ?? config.PREFIX;
	if(!message.content.startsWith(prefix)) return;

	let args = message.content.slice(prefix.length).trim().split(/ +/g);
	const cmd = args.shift().toLowerCase();
	const color = require("../storage/color.json");

	let commandFile = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
	if(!commandFile) return;
	if(!cooldowns.has(commandFile.conf.name)) cooldowns.set(commandFile.conf.name, new Collection());

	const member = message.member;
	const now = Date.now();
	const timestamps = cooldowns.get(commandFile.conf.name);
	let cooldownAmount = (commandFile.conf.cooldown || 5) * 1000;

	if(!timestamps.has(member.id)) {
		timestamps.set(member.id, now);
	} else {
		const expirationTime = timestamps.get(member.id) + cooldownAmount;

		if(now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			let err = new EmbedBuilder()
			.setColor(color.error)
			.setTitle("Cooldown")
			.setDescription(`Wait \`${timeLeft.toFixed(1)}\` second(s)`);
			const tempMsg = await message.channel.send({ embeds: [err] });
			await wait(expirationTime - now);
			return tempMsg.delete();
		};

		timestamps.set(member.id, now);
		setTimeout(() => timestamps.delete(member.id), cooldownAmount);
	};

	try {
		let commands = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
		if(!commands) return;
		if(commands.conf.slash) return client.util.embed(message, "Please use slash command (/)", "error");
		commands.run(client, message, args, color, prefix, config);
	} catch (e) {
		console.error(e);
	} finally {
		console.info(`${message.author.tag} - ${cmd} - ${message.guild.name}`);
	};
};