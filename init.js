require("dotenv").config();

(async() => {
	const { SlashCommandBuilder, REST, Routes } = require('discord.js');
	const { BOT_ID, GUILD_ID } = require('./src/storage/config.json');

	const commands = [
		new SlashCommandBuilder().setName('coupon')
		.setDescription("Manage webstore coupons")
		.addSubcommand(subcmd =>
			subcmd
			.setName("list")
			.setDescription('Replies with list of active coupons. Max 25 coupons'))
		.addSubcommandGroup(subcmdgr =>
			subcmdgr
			.setName("create")
			.setDescription('Create a coupon')
			.addSubcommand(subcmd =>
				subcmd
				.setName('percentage')
				.setDescription('Using % for discount, example 10% discount')
				.addNumberOption(option =>
					option
					.setName('percent')
					.setDescription('Example: 15% discount')
					.setMinValue(1)
					.setMaxValue(100)
					.setRequired(true)
				)
				.addIntegerOption(option =>
					option
					.setName('uses')
					.setDescription('Limit of uses, enter 0 for unlimited')
					.setMinValue(0)
					.setRequired(true)
				)
				.addNumberOption(option =>
					option
					.setName('minimum')
					.setDescription('Minimum value of basket before the coupon can be redeemed, you can put 0 if you want to')
					.setMinValue(0)
					.setRequired(true)
				)
			)
			.addSubcommand(subcmd =>
				subcmd
				.setName('fixed')
				.setDescription('Using fixed price for discount, example $10 discount')
				.addNumberOption(option =>
					option
					.setName('amount')
					.setDescription('Example: $10 discount')
					.setMinValue(1)
					.setRequired(true)
				)

				.addIntegerOption(option =>
					option
					.setName('uses')
					.setDescription('Limit of uses, enter 0 for unlimited')
					.setMinValue(0)
					.setRequired(true)
				)

				.addNumberOption(option =>
					option
					.setName('minimum')
					.setDescription('Minimum value of basket before the coupon can be redeemed, you can put 0 if you want to')
					.setMinValue(0)
					.setRequired(true)
				)
			)
		)
		.addSubcommand(subcmd =>
			subcmd
			.setName("get")
			.setDescription('Get a coupon information')
			.addStringOption(option =>
				option
				.setName("id")
				.setDescription("The coupon ID")
				.setRequired(true)
			)
		)
		.addSubcommand(subcmd =>
			subcmd
			.setName("delete")
			.setDescription('Delete a coupon')
			.addStringOption(option =>
				option
				.setName("id")
				.setDescription("The coupon ID")
				.setRequired(true)
			)
		),

		new SlashCommandBuilder().setName('giftcard')
		.setDescription("Manage webstore gift cards")
		.addSubcommand(subcmd =>
			subcmd
			.setName("list")
			.setDescription('Replies with list of gift cards')
			.addStringOption(option =>
				option
				.setName('type')
				.setDescription('Choose the gift cards status')
				.setRequired(true)
				.addChoices(
					{ name: "Active Gift Cards", value: "active" },
					{ name: "Void Gift Card", value: "void" }
				)
			)
		)
		.addSubcommand(subcmd =>
			subcmd
			.setName('create')
			.setDescription('Create a gift card of a specified amount.')
			.addStringOption(option =>
				option
				.setName('expires_at')
				.setDescription('Gift card\'s expiry date in the format yyyy-mm-dd hh:mm:ss')
				.setMinLength(1)
				.setMaxLength(100)
				.setRequired(true)
			)
			.addStringOption(option =>
				option
				.setName('note')
				.setDescription('The note that will be stored against the gift card')
				.setMinLength(1)
				.setMaxLength(1024)
				.setRequired(true)
			)
			.addNumberOption(option =>
				option
				.setName('amount')
				.setDescription('The currency value of the gift card should have upon creation')
				.setMinValue(1)
				.setRequired(true)
			)
		)
		.addSubcommand(subcmd =>
			subcmd
			.setName("get")
			.setDescription('Retrieve a gift card by ID')
			.addStringOption(option =>
				option
				.setName("id")
				.setDescription("The ID of the gift card")
				.setRequired(true)
			)
		)
		.addSubcommand(subcmd =>
			subcmd
			.setName("topup")
			.setDescription('Top-up (Add more credit) to an existing gift card')
			.addStringOption(option =>
				option
				.setName("id")
				.setDescription("The ID of the gift card")
				.setRequired(true)
			)
			.addNumberOption(option =>
				option
				.setName('amount')
				.setDescription('The currency value the gift card should have added to it')
				.setRequired(true)
			)
		),

		new SlashCommandBuilder().setName('payments')
		.setDescription("Retrieve the latest payments (up to 25 per embed)")
		.addIntegerOption(option =>
			option
			.setName('page')
			.setDescription('The page number to return (optional)')
			.setMinValue(1)
		),

		new SlashCommandBuilder().setName('listing')
		.setDescription("Get the categories and packages")

		new SlashCommandBuilder().setName('lookup')
		.setDescription("Lookup information")
		.addSubcommand(subcmd =>
			subcmd
			.setName("player")
			.setDescription('Returns player lookup information')
			.addStringOption(option =>
				option
				.setName('player')
				.setDescription('Player name / UUID')
				.setRequired(true)
			)
		)
		.addSubcommand(subcmd =>
			subcmd
			.setName("transaction")
			.setDescription('Returns transaction lookup information')
			.addStringOption(option =>
				option
				.setName('tid')
				.setDescription('Transaction ID')
				.setRequired(true)
			)
		)
	]
	.map(command => command.toJSON());

	const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

	rest.put(Routes.applicationGuildCommands(BOT_ID, GUILD_ID), { body: commands })
	.then((data) => console.log(`Registered ${data.length} slash cmds.`))
	.catch(console.error);
})();