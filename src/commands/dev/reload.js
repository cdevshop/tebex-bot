exports.run = async(bot, message, args, color, prefix, config) => {
	if(!config.DEVELOPERS.includes(message.author.id)) return;

	const category = args[0];
	if(!bot.helps.has(category))return bot.util.embed(message, "Category not found", "error");

	let command = args[1];
	if(!command) return bot.util.embed(message, "Command not found", "error");

	if(bot.commands.has(command)) {
		command = bot.commands.get(command);
	} else if(bot.aliases.has(command)) {
		command = bot.commands.get(bot.aliases.get(command));
	} else {
		command = null;
	};

	if(!command) return bot.util.embed(message, "Command not registered", "error");

	try {
		delete require.cache[require.resolve(`../../../src/commands/${category}/${command.conf.name}.js`)];
		var cmd = require(`../../../src/commands/${category}/${command.conf.name}`);
		bot.commands.set(command.conf.name, cmd);
		if(cmd.conf.aliases) {
			cmd.conf.aliases.forEach(alias => {
				bot.aliases.set(alias, cmd.conf.name);
			});
		};
		return bot.util.embed(message, `${command.conf.name} reloaded`, "success");
	} catch(err) {
		return bot.util.embed(message, err.message, "error");
	};
};

exports.conf = {
	name: "reload",
	description: "Reload commands without restarting the bot",
	aliases: ["rl"],
	cooldown: 1,
	examples: [
		"rl basic stats",
		"reload dev ev"
	]
};