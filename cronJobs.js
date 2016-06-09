var db = require('./database')
var CronJob = require('cron').CronJob;
var job1 = new CronJob('00 30 02 * * *', function() {
    deleteTexted = function(){
      var pg = require('pg');
      var query = 'SELECT * FROM customer_info WHERE alerted = true'
      sendQuery2(query, [], function(row){
        var q = 'INSERT INTO deleted_users (inst, session, dept, section, phone_number, provider) values ($1, $2, $3, $4, $5, $6)'
        sendQuery(q, [row.inst, row.session, row.dept, row.section, row.phone_number, row.provider], function(r){})
      })
      var q = 'DELETE FROM customer_info WHERE alerted = true';
      sendQuery(q,[],function(r){
        console.log(r)
      })
    }
    deleteTexted();
  }, function(){
    logger.log("deleted users")
  }, 
  false, 'America/New_York');
job1.start();
/*
var job2 = new CronJob('00 00 * * * *', function() {
    var changeFromText = function(){
      var pg = require('pg');
      var q = "UPDATE customer_info SET texted = false WHERE texted = true AND delete_when_texted = false";
      var client = new pg.Client(process.env.DATABASE_URL);
      client.connect();
      var query = client.query(q);
      query.on('row', function(row){
        console.log(row)
      })
      query.on('end', function(){
        client.end();
      })
    };
    changeFromText();
    console.log("Updated Users")
  }, null, 
  false, 'America/New_York');
job2.start();*/
var job3 = new CronJob('00 00 04 * * *', function(){
	var updateDatabase = function(){
		var pg = require('pg')
		//
		var query = ""
		//Get inst
		//	For each inst
		//		for each session
		//			for each dept
		//				for each class
		//					for each section
		//						addClassToQuery
		//send query
	}
})
job3.start()