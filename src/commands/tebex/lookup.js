const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const moment = require("moment");
const fs = require("fs");

function checkTebexTransactionID(transactionID) {
	let rawdata = fs.readFileSync("src/storage/claim.json");
	let data = JSON.parse(rawdata);
	let found = false;
  	for (let i = 0; i < data.length; i++) {
    		if (data[i].TransactionID === transactionID) {
      			found = data[i];
      			break;
    		} else {
      			found = false;
    		}
  	}

  	return found;
}

exports.run = async(bot, interaction, color, prefix, config) => {
	if(!config.tebex.lookupperms.includes(interaction.user.id)) return;
	await interaction.deferReply();

	const method = { method: "GET", headers: { 'X-Tebex-Secret': process.env.TEBEX_SECRET } };
	const subcommand = interaction.options.getSubcommand();
	if(subcommand === "player") {
		const player = interaction.options.getString("player");
		const getPlayer = await fetch(`https://plugin.tebex.io/user/${player}`, method);

		let data = await getPlayer.json();
		if(data.error_code) return await interaction.editReply(`${info.error_code } | ${info.error_message}`);
		if(!data) return await interaction.editReply("Player not found");

		let listOfPayments = [];
		const { payments } = data;
		for(var i of payments) {
			listOfPayments.push({
				name: i.txn_id,
				value: `Time: ${moment.utc(Number(i.time + "000")).format("LL")}\nPrice: **${i.currency} ${i.price}**\nStatus: ${i.status}`,
				inline: true
			});
		};

		const embed = new EmbedBuilder()
		.setColor(color.info)
		.setAuthor({ name: data.player.username })
		.setDescription(`**Last 25 payments**`)
		.addFields(listOfPayments);
		return await interaction.editReply({ embeds: [embed] });
	};

	if(subcommand === "transaction") {
		const tid = interaction.options.getString("tid");
		const getTransaction = await fetch(`https://plugin.tebex.io/payments/${tid}`, method);
		const info = await getTransaction.json();

		let packages = [];
		for(var i of info.packages) {
			packages.push(`\`${i.quantity} ${i.name}\``);
		};
		
		let isClaimed = checkTebexTransactionID(tid);

		const embed = new EmbedBuilder()
		.setColor(color.info)
		.setAuthor({ name: tid })
		.setDescription(`Notes: ${info.notes.join("\n")}`)
		.addFields([
			{ name: "ID", value: String(info.id), inline: true },
			{ name: "Amount", value: `**${info.currency.iso_4217} ${info.amount}**`, inline: true },
			{ name: "Date", value: moment.utc(info.date).format("MMM DD, YYYY HH:mm"), inline: true },
			{ name: "Gateway", value: info.gateway.name, inline: true },
			{ name: "Status", value: info.status, inline: true },
			{ name: "Creator Code", value: info.creator_code ?? "None D:", inline: true },
			{ name: "Email", value: `||${info.email}||`, inline: true },
			{ name: "Player", value: `${info.player.name}`, inline: true },
			{ name: "Packages", value: packages.join(", "), inline: true },
			{ name: "Claimed By", value: isClaimed ? `<@${isClaimed.DiscordID}>` : "Not Claimed", inline: true }
		]);
		return await interaction.editReply({ embeds: [embed] });
	};
};

exports.conf = {
	name: "lookup",
	description: "Return transaction information from TID or username",
	cooldown: 5,
	slash: true,
	examples: [
		"lookup joemama",
		"lookup tbx-69420"
	]
};
