const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const moment = require("moment");

exports.run = async(bot, interaction, color, prefix, config) => {
	if(!interaction.member.permissions.has("MANAGE_GUILD")) return;
	await interaction.deferReply();

	const method = { method: "GET", headers: { 'X-Tebex-Secret': process.env.TEBEX_SECRET } };
	const page = interaction.options.getInteger("page") ?? 1;
	const getPayments = await fetch(`https://plugin.tebex.io/payments?paged=${page}`, method);

	const data = await getPayments.json();
	if(data.error_code) return await interaction.editReply(`${info.error_code } | ${info.error_message}`);

	let fields = [];
	for(var i of data.data) {
		fields.push({
			name: `ID: ${i.id}`,
			value: `__**${i.status}**__
Total: \`${i.currency.symbol} ${i.amount}\`
${moment.utc(i.date).format("MMM DD, YYYY HH:mm")}
${i.player.name ?? "Not found"}
${i.packages.map(x => `・**${x.quantity}** ${x.name}`).join("\n・")}`,
			inline: true
		});
	};

	const embed = new EmbedBuilder()
	.setColor(color.info)
	.setTitle(`Payments Page ${data.current_page}`)
	.addFields(fields);
	return await interaction.editReply({ embeds: [embed] });
};

exports.conf = {
	name: "payments",
	description: "Retrieve the latest payments (up to 25 per embed)",
	cooldown: 5,
	slash: true,
	examples: [
		"payments",
		"payments 2"
	]
};
