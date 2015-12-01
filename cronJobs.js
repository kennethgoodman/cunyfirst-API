var CronJob = require('cron').CronJob;
var job1 = new CronJob('00 30 02 * * *', function() {
    deleteTexted = function(){
      var pg = require('pg');
      var q = 'DELETE FROM clients_and_their_info WHERE texted = true AND delete_when_texted = true';
      var client = new pg.Client(process.env.DATABASE_URL);
      client.connect();
      var query = client.query(q);
      query.on('row', function(row){
        console.log(row)
      })
      query.on('end', function(){
        client.end();
      })
    }
    deleteTexted();
  }, function(){
    console.log("deleted users")
  }, 
  false, 'America/New_York');
job1.start();
var job2 = new CronJob('00 00 * * * *', function() {
    var changeFromText = function(){
      var pg = require('pg');
      var q = "UPDATE clients_and_their_info SET texted = false WHERE texted = true AND delete_when_texted=false";
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
job2.start();