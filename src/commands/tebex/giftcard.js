const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const moment = require("moment");

exports.run = async(bot, interaction, color, prefix, config) => {
	if(!config.tebex.giftcardperms.includes(interaction.user.id)) return;
	await interaction.deferReply();

	const subcommand = interaction.options.getSubcommand();
	if(subcommand === "create") {
		const embed = new EmbedBuilder()
		.setColor(color.success)
		.setTitle("Coupon Created")

		let fields;
		const expiresAt = interaction.options.getString("expires_at");
		const note = interaction.options.getString("note");
		const amount = interaction.options.getNumber("amount");

		const now = moment.utc();
		const time = moment.utc(expiresAt);
		if(!time.isValid()) return await interaction.editReply("Invalid timestamp, it must be `yyyy-mm-dd hh:mm:ss`");
		if(time < now) return await interaction.editReply("My brother / sister in christ... that date is on the past, the gift card will be expired immediately");

		const result = await createGiftCard(expiresAt, note, amount);
		if(typeof result === "string") return await interaction.editReply(result);
		if(result.error) return await interaction.editReply(`${info.error_code } | ${info.error_message}`);

		const data = result.data;
		const expired = data.expires_at ? moment.utc(data.expires_at).format("LLL") : "No Expiry Date";

		const finalEmbed = new EmbedBuilder()
		.setColor(color.success)
		.setTitle("Gift Card Created")
		.setDescription(`Note: ${data.note ?? "No data"}`)
		.addFields([
			{ name: "Code", value: `\`${data.code}\`` },
			{ name: "ID", value: `${data.id}`, inline: true },
			{ name: "Balance", value: `Starting: **${data.balance.currency} ${data.balance.starting}**`, inline: true },
			{ name: "Date (UTC)", value: `Created at: ${moment.utc(data.created_at).format("LLL")}
Expires at: ${expired}` }
		]);
		return await interaction.editReply({ embeds: [finalEmbed] });
	};

	if(subcommand === "list") {
		const type = interaction.options.getString("type");
		const listEmbed = new EmbedBuilder()
		.setColor(color.info)
		.setTitle(`${type} gift card`)
		.setDescription("The expiry date using UTC time zone")

		const response = await fetch("https://plugin.tebex.io/gift-cards", {
			method: "GET",
			headers: {
				'X-Tebex-Secret': process.env.TEBEX_SECRET
			}
		});

		let data = await response.json();
		data = data.data;
		let fields = [];

		if(data.length) {
			for(var card of data) {
				if(type === "active" && card.void === true) continue;
				if(type === "void" && card.void === false) continue;
				fields.push({
					name: card.code,
					value: `ID: \`${card.id}\`
	Starting: ${card.balance.currency} ${card.balance.starting}
	Remaining: **${card.balance.currency} ${card.balance.remaining}**
	Expires at: ${card.expires_at === null ? "No expiry date" : moment.utc(card.expires_at).format("LLL")}`,
					inline: true
				});
			};
		} else {
			fields.push({ name: "Not Found", value: `There is no gift card` });
		};

		listEmbed.addFields(fields);
		return await interaction.editReply({ embeds: [listEmbed] });
	};

	if(subcommand === "get") {
		const id = interaction.options.getString("id");
		const getInfo = await fetch(`https://plugin.tebex.io/gift-cards/${id}`, {
			method: "GET",
			headers: {
				'X-Tebex-Secret': process.env.TEBEX_SECRET
			}
		});
		const info = await getInfo.json();
		if(info.error_code) return await interaction.editReply(`${info.error_code } | ${info.error_message}`);

		const data = info.data;
		const expired = data.expires_at ? moment.utc(data.expires_at).format("LLL") : "No Expiry Date";
		const cur = data.balance.currency;

		const dataEmbed = new EmbedBuilder()
		.setColor(color.info)
		.setTitle("Gift Card Info")
		.setDescription(`Note: ${data.note}`)
		.addFields([
			{ name: "Code", value: data.code },
			{ name: "ID", value: `${data.id}`, inline: true },
			{ name: "Void", value: `${data.void === true ? "Yes" : "No"}`, inline: true },
			{ name: "Balance", value: `Starting: ${cur} ${data.balance.starting}
Remaining: **${cur} ${data.balance.remaining}**` },
			{ name: "Date (UTC)", value: `Created at: ${moment.utc(data.created_at).format("LLL")}
Expires at: ${expired}` }
		]);
		return await interaction.editReply({ embeds: [dataEmbed] });
	};

	if(subcommand === "topup") {
		const id = interaction.options.getString("id");
		const amount = interaction.options.getNumber("amount");
		const getInfo = await fetch(`https://plugin.tebex.io/gift-cards/${id}`, {
			method: "PUT",
			body: JSON.stringify({
				amount
			}),
			headers: {
				'Content-Type': 'application/json',
				'X-Tebex-Secret': process.env.TEBEX_SECRET
			}
		});

		const info = await getInfo.json();
		const data = info.data;
		if(info.error_code) return await interaction.editReply(`${data.error_code } | ${data.error_message}`);

		const dataEmbed = new EmbedBuilder()
		.setColor(color.success)
		.setTitle("Gift Card")
		.setDescription(`Gift card balance changed: **${data.balance.currency} ${amount > 0 ? `+${amount}` : amount}**`)
		.addFields([
			{ name: "ID", value: `${data.id}`, inline: true },
			{ name: "Code", value: data.code, inline: true },
			{ name: "Remaining", value: `**${data.balance.remaining}**`, inline: true }
		]);
		return await interaction.editReply({ embeds: [dataEmbed] });
	};

	async function createGiftCard(expires_at, note, amount) {
		try {
			let body = {
				expires_at, note, amount
			};

			const response = await fetch("https://plugin.tebex.io/gift-cards", {
				method: "POST",
				body: JSON.stringify(body),
				headers: {
					'Content-Type': 'application/json',
					'X-Tebex-Secret': process.env.TEBEX_SECRET
				}
			});

			const data = await response.json();

			return data;
		} catch(err) {
			return `Error: ${err.message}`;
		};
	};
};

exports.conf = {
	name: "giftcard",
	description: "Manage gift cards",
	cooldown: 5,
	slash: true,
	examples: [
		"giftcard create"
	]
};
