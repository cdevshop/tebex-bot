const Discord = require("discord.js");
const fs = require("fs");

module.exports = client => {
	client.commands = new Discord.Collection();
	client.aliases = new Discord.Collection();
	client.helps = new Discord.Collection();

	fs.readdir("./src/commands/", (err, categories) => {
		if(err) console.log(err);
		console.log(`Loaded ${categories.length} categories`);

		categories.forEach(category => {
			let moduleConf = require(`../commands/${category}/module.json`);
			moduleConf.path = `./commands/${category}`;
			moduleConf.cmds = [];

			client.helps.set(category, moduleConf);
			if(!moduleConf) return;

			fs.readdir(`./src/commands/${category}`, (err, files) => {
				if(err) console.log(err);
				let commands = new Array();

				files.forEach(file => {
					if (!file.endsWith(".js")) return;

					let prop = require(`../commands/${category}/${file}`);
					let cmdName = file.split(".")[0];

					client.commands.set(prop.conf.name, prop);

					if(!prop.conf.slash) {
						prop.conf.aliases.forEach(alias => {
							client.aliases.set(alias, prop.conf.name);
						});
					};

					client.helps.get(category).cmds.push(prop.conf.name);
				});
			});
		});
	});
};