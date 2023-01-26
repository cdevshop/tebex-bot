const { exec } = require("child_process");

exports.run = async (bot, message, args, color, prefix, config) => {
	if(!config.DEVELOPERS.includes(message.author.id)) return;
	let input = args.join(" ");

	exec(`${input}`, async(error, stdout) => {
		const response = (error || stdout);
		await message.reply({
			content: `\`\`\`>_ ${input}\n${response}\`\`\``
		}).catch(console.error);
	});
};

exports.conf = {
	name: "execute",
	description: "Execute bash script",
	aliases: ["$", "exec"],
	cooldown: 2,
	examples: [
		"free -h",
		"echo 'your mom'"
	]
};