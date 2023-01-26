const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

exports.run = async(bot, interaction, color, prefix, config) => {
	if(!config.tebex.couponperms.includes(interaction.user.id)) return;
	await interaction.deferReply();

	const currency = await bot.util.getCurrency();
	const group = interaction.options.getSubcommandGroup();
	const subcommand = interaction.options.getSubcommand();
	if(group === "create") {
		const embed = new EmbedBuilder()
		.setColor(color.success)
		.setTitle("Coupon Created")
		.setDescription(`Created by this cool user: **${interaction.user.username}**`)

		let fields;
		const subcmd = interaction.options.getSubcommand();
		if(subcmd === "percentage") {
			const percent = interaction.options.getNumber("percent");
			const uses = interaction.options.getInteger("uses");
			const minimum = interaction.options.getNumber("minimum");

			const result = await createCoupon(percent, uses, minimum, "%");
			if(typeof result === "string") return await interaction.editReply(result);

			const data = result.data;
			const expired = data.expire.redeem_unlimited === true ? "Unlimited" : `${data.expire.limit}`;

			fields = [
				{ name: "Code", value: `\`${data.code}\`` },
				{ name: "ID", value: `${data.id}`, inline: true },
				{ name: "Discount", value: `**${data.discount.percentage}%**`, inline: true },
				{ name: "Redeem Limit", value: expired, inline: true },
				{ name: "Minimum Basket Value", value: `${result.currency} ${data.minimum}` }
			]
		};

		if(subcmd === "fixed") {
			const amount = interaction.options.getNumber("amount");
			const uses = interaction.options.getInteger("uses");
			const minimum = interaction.options.getNumber("minimum");

			const result = await createCoupon(amount, uses, minimum, "$");
			if(typeof result === "string") return await interaction.editReply(result);

			const data = result.data;
			const expired = data.expire.redeem_unlimited === true ? "Unlimited" : `${data.expire.limit}`;

			fields = [
				{ name: "Code", value: `\`${data.code}\`` },
				{ name: "ID", value: `${data.id}`, inline: true },
				{ name: "Discount", value: `**${result.currency} ${data.discount.value}**`, inline: true },
				{ name: "Redeem Limit", value: expired, inline: true },
				{ name: "Minimum Basket Value", value: `${result.currency} ${data.minimum}` }
			]
		};

		const finalEmbed = new EmbedBuilder()
		.setColor(color.success)
		.setTitle("Coupon Created")
		.setDescription(`Created by this cool user: **${interaction.user.username}**`)
		.addFields(fields)
		return await interaction.editReply({ embeds: [finalEmbed] });
	};

	if(subcommand === "list") {
		const listEmbed = new EmbedBuilder()
		.setColor(color.info)
		.setTitle("Active Coupons")

		const response = await fetch("https://plugin.tebex.io/coupons", {
			method: "GET",
			headers: {
				'X-Tebex-Secret': process.env.TEBEX_SECRET
			}
		});

		let { data } = await response.json();

		let fields = [];
		for(var coupon of data) {
			fields.push({
				name: coupon.code,
				value: `ID: \`${coupon.id}\`
Discount: ${coupon.discount.type === "value" ? `**${currency} ${coupon.discount.value}**` : `**${coupon.discount.percentage}%**` }
Redeem Limit: ${coupon.expire.redeem_unlimited === true ? "Unlimited" : `${coupon.expire.limit}`}
Min Basket Value: ${currency} ${coupon.minimum}`,
				inline: true
			});
		};

		// 25 fields max
		fields = fields.slice(0, 25);

		listEmbed.addFields(fields);
		return await interaction.editReply({ embeds: [listEmbed] });
	};

	if(subcommand === "get") {
		const id = interaction.options.getString("id");
		const getInfo = await fetch(`https://plugin.tebex.io/coupons/${id}`, {
			method: "GET",
			headers: {
				'X-Tebex-Secret': process.env.TEBEX_SECRET
			}
		});
		const info = await getInfo.json();
		if(info.error_code) return await interaction.editReply(`${info.error_code } | ${info.error_message}`);

		const data = info.data;
		const dataEmbed = new EmbedBuilder()
		.setColor(color.info)
		.setTitle("Coupon Info")
		.addFields([
			{ name: "Coupon Code", value: data.code },
			{ name: "Coupon ID", value: `${data.id}`, inline: true },
			{ name: "Discount", value: `${data.discount.type === "value" ? `**${currency} ${data.discount.value}**` : `**${data.discount.percentage}%**` }`, inline: true },
			{ name: "Redeem Limit", value: `${data.expire.redeem_unlimited === true ? "Unlimited" : `${data.expire.limit}`}`, inline: true },
			{ name: "Minimum Basket Value", value: `${currency} ${data.minimum}` }
		]);
		return await interaction.editReply({ embeds: [dataEmbed] });
	};

	if(subcommand === "delete") {
		const id = interaction.options.getString("id");
		const getInfo = await fetch(`https://plugin.tebex.io/coupons/${id}`, {
			method: "DELETE",
			headers: {
				'X-Tebex-Secret': process.env.TEBEX_SECRET
			}
		});

		const statusCode = (await getInfo).status;
		if(statusCode === 404) {
			const info = await getInfo.json();
			return await interaction.editReply(`${info.error_code } | ${info.error_message}`);
		};

		const dataEmbed = new EmbedBuilder()
		.setColor(color.success)
		.setTitle("Coupon Deleted")
		.addFields([
			{ name: "Coupon ID", value: `${id}`, inline: true },
			{ name: "Author", value: interaction.user.tag, inline: true },
			{ name: "Timestamp (UTC)", value: require('moment-timezone')(Date.now()).tz('Europe/London').format("LLL") }
		]);
		return await interaction.editReply({ embeds: [dataEmbed] });
	};

	async function createCoupon(amount, uses, minimum, type) {
		try {
			const code = Math.random().toString(36).substr(2, 7);
			let body = {
				code, "effective_on": "cart",
				"basket_type": "both", "discount_application_method": 2
			};

			body["expire_never"] = true;
			body["discount_type"] = type === "%" ? "percentage" : "value";
			body["redeem_unlimited"] = uses > 0 ? false : true;
			if(uses > 0) body["expire_limit"] = uses;
			body["minimum"] = minimum;
			if(type === "%") {
				body["discount_amount"] = 0;
				body["discount_percentage"] = amount;
			} else {
				body["discount_amount"] = amount;
				body["discount_percentage"] = 0;
			};

			const response = await fetch("https://plugin.tebex.io/coupons", {
				method: "POST",
				body: JSON.stringify(body),
				headers: {
					'Content-Type': 'application/json',
					'X-Tebex-Secret': process.env.TEBEX_SECRET
				}
			});

			let data = await response.json();
			data.currency = currency;
			return data;
		} catch(err) {
			return `Error: ${err.message}`;
		};
	};
};

exports.conf = {
	name: "coupon",
	description: "Manage your webstore coupon",
	cooldown: 5,
	slash: true,
	examples: [
		"coupon create",
		"coupon list"
	]
};
