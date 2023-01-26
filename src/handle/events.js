const config = require("../storage/config.json");
const { readdirSync } = require("fs");

module.exports = client => {
	const events = readdirSync("./src/events/");
	console.log(`Found ${events.length} events`);

	for(let event of events) {
		let file = require(`../events/${event}`);
		if(file.info.once) {
			client.once(file.info.name, (...args) => file.run(client, ...args, config));
		} else {
			client.on(file.info.name, (...args) => file.run(client, ...args, config));
		};
	};
};