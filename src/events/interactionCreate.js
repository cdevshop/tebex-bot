const { Events, ActivityType, MessageEmbed } = require("discord.js"),
color = require("../storage/color.json");


exports.info = {
	name: Events.InteractionCreate,
	once: false
};

exports.run = async (client, interaction, config) => {
	if(!interaction.isChatInputCommand()) return;

	await require(`../commands/tebex/${interaction.commandName}`)
	.run(client, interaction, color, "/", config);
};