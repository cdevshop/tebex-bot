const config = require("../storage/config.json");
const colors = require("../storage/color.json");
const { EmbedBuilder } = require("discord.js");
const snek = require("node-fetch");
const ms = require("ms");

class Util {
	constructor() {
		this.getCurrency = async function Hastebin(text) {
			const getInfo = await snek("https://plugin.tebex.io/information", {
				method: "GET",
				headers: {
					'X-Tebex-Secret': process.env.TEBEX_SECRET
				}
			});
			const currency = await getInfo.json();
			return currency.account.currency.symbol;
		};

		this.parseDur = function Pretty(time) {
			return ms(time, { long: true });
		};

		this.embed = async function CreateEmbed(location, description, status, cmd = "", prefix = config.PREFIX) {
			const embed = new EmbedBuilder()
			.setColor(colors[status])
			.setDescription(description)

			if(status === "cmd") {
				embed.addFields([
					{ name: "More Info", value: `Type **${prefix}cmd ${cmd}** for more information`}
				]);
			};

			return await location.reply({ embeds: [embed] });
		};
	};
};

module.exports = Util;