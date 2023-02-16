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

function writeNewClaimData(claimData) {
  	let rawdata = fs.readFileSync("src/storage/claim.json");
  	let data = JSON.parse(rawdata);

  	data.push(claimData);

  	fs.writeFileSync("src/storage/claim.json", JSON.stringify(data));
}

exports.run = async (bot, interaction, color, prefix, config) => {
  	if(!config.tebex.lookupperms.includes(interaction.user.id)) return;
  	await interaction.deferReply();
  	const method = {method: "GET", headers: { "X-Tebex-Secret": process.env.TEBEX_SECRET } };
  	const subcommand = interaction.options.getSubcommand();

  	if(subcommand === "transaction") {
    		const tid = interaction.options.getString("tid");
    		const did = interaction.options.getString("did");
    		const getTransaction = await fetch(`https://plugin.tebex.io/payments/${tid}`, method);
    		const info = await getTransaction.json();

    		let packages = [];
    		for(var i of info.packages) {
      			packages.push(`\`${i.quantity} ${i.name}\``);
    		};
  
    		const claimData = {
			TransactionID: tid,
      			DiscordID: did,
    		};
  
    		const hasClaimed = checkTebexTransactionID(claimData.TransactionID);

    		let embed = new EmbedBuilder();

    		if (hasClaimed === false) {
      			embed
        		.setColor(color.success)
        		.setAuthor({ name: tid })
        		.setDescription(`Claimed ${claimData.DiscordID} to the Transaction ID.`);
      			writeNewClaimData(claimData);
    		} else {
      			embed
        		.setColor(color.error)
        		.setAuthor({ name: tid })
        		.setDescription(`Transaction ID has already been claimed.`);
    		}
    		return await interaction.editReply({ embeds: [embed] });
  	}
};

exports.conf = {
  name: "claim",
  description: "Claim a Discord ID to a Transaction ID.",
  cooldown: 5,
  slash: true,
  examples: ["claim tbx-69420 123456789012345678"],
};
