const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const moment = require("moment");

exports.run = async(bot, interaction, color, prefix, config) => {
	if(!interaction.member.permissions.has("MANAGE_GUILD")) return;
	await interaction.deferReply();

	const method = { method: "GET", headers: { 'X-Tebex-Secret': process.env.TEBEX_SECRET } };
	const getList = await fetch("https://plugin.tebex.io/listing", method);

	let data = await getList.json();
	if(data.error_code) return await interaction.editReply(`${info.error_code } | ${info.error_message}`);
	if(!data || !data.categories.length) return await interaction.editReply("No data :skull:");

	const currency = await bot.util.getCurrency();
	let fields = [];

	for(var category of data.categories) {
		const tempPkg = [];
		for(var pkg of category.packages) {
			tempPkg.push(`**${currency} ${pkg.price}** - ${pkg.name}`);
		};
		fields.push({ name: category.name, value: tempPkg.join("\n"), inline: true });
	};

	const embed = new EmbedBuilder()
	.setColor(color.info)
	.setTitle("Listing")
	.addFields(fields);
	return await interaction.editReply({ embeds: [embed] });
};

exports.conf = {
	name: "listing",
	description: "Get the categories and packages",
	cooldown: 5,
	slash: true,
	examples: [
		"listing"
	]
};
