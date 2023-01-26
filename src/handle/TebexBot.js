const { Client } = require("discord.js");
const { QuickDB } = require('quick.db');
const db = new QuickDB({ table: "DB" });

class TebexBot extends Client {
	constructor (opt) {
		super (opt);

		this.db = db;
		this.color = require("../storage/color.json");
		this.package = require("../../package.json");
		this.utils = require("./util.js");
		this.util = new this.utils();
	};
};

module.exports = TebexBot;