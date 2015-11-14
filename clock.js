//TODO: SCHEDULE JOBS:
// 1. delete users who have been texted
// 2.  
var CronJob = require('cron').CronJob;
var worker = ('./worker');
var deleteTableContent = new CronJob({
	cronTime: "00 00 01 * * 1-5",
	onTick: deleteTable,
	start: true,
	timeZone: 'America/Los_Angeles'
});
var job = new CronJob({
	cronTime: "00 00 02 * * 1-5",
	onTick: addDataToTable,
	start: true,
	timeZone: 'America/Los_Angeles'
});
