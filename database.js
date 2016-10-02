try{
    var dotenv = require('dotenv')
    dotenv.load();
}catch(err){
    //do nothing if this fails, we are in dev
}
var pg = require('pg');
pg.defaults.poolIdleTimeout = 2000; //2 seconds
var counter = 0;
var logger = require('tracer').console({
                  format : [ "<{{title}}> {{file}}:{{line}}: {{message}}", {error: "<{{title}}> {{file}}:{{line}}: {{message}} \nCall Stack: {{stack}}"}],
                  preprocess: function(data){ data.title = data.title.toUpperCase()}
              })
global.logger = logger
queryDatabasePerRow = function(query,callback){
	if(query == undefined || query == null){
		callback({error:"bad query"})
		return;
	}
	pg.connect(process.env.DATABASE_URL, function(err, client) {
	  if (err) logger.error(err);
	  
	  client
	    .query(query)	//'SELECT * FROM clients_and_their_info')
	    .on('row', function(row) {
	      callback(row)
	      done();
	      return JSON.stringify(row)
	    });
	});
}
sendQuery = function(query, params, callback){
	if(query == undefined || query == null){
		callback({error:"bad query"})
		logger.error("bad query\nquery: %s\n params:%s", query, params)
		return;
	}
	//console.log(query)
	pg.connect(process.env.DATABASE_URL, function(err, client) {
		  if (err) {
		  	logger.error("Error while connecting\n%j", err);
		  	pg.end();
		  	return;
		  }
		  //console.log('Connected to postgres! Getting schemas...');
		  client
		    .query(query, params, function(err, result) {
			    if(err) {
			      err["Error"] = true;
			      logger.error('Error running query\nquery: %s\n params: %s\nerror: %j', query, params, err);
			      callback(err)
			      client.end();
			    }
			    else{
			    	callback(result);
			    	client.end();
			    }
			})
		})
}
sendQuery2 = function(q,params, callback){
	if(q == undefined || q == null){
		logger.error("bad query\nquery: %s\n params:%s", query, params)
		callback({error:"bad query"})
		return;
	}
	var client = new pg.Client(process.env.DATABASE_URL);
	client.connect();
	var query = client.query(q,params);
	query.on('row', function(row){
		callback(row)
	})
	query.on('end', function(){
		client.end();
	})
}
viewTable = function(callback){
	sendQuery("SELECT schools.name AS schoolName, session.name, session.id, session.school  \
			   FROM schools, session \
			   WHERE schools.id = session.school \
			   AND (select count(*) from classes_1 where school = session.school and session = session.id) > 0" //eliminate all sessions with no classes
			   , [], callback)
}
testAddDataToTable = function(callback){
	count = 0
	var interval = setInterval( function(){
		sendQuery('Insert into testTable (data) values (\'' + count + '\')',[], callback);
		count += 1
		if(count > 50)
			clearInterval(interval)
	}, 50)
};
getInstitutions = function(callback){
	var tries = 0;
	temp = function(){
		viewTable(function(result){
			try{
				callback(result["rows"])
			}
			catch(err){
				if(tries < 3){
					tries += 1;
					temp()
				}
				else{
					callback([])
				}
			}
		})
	};
	temp()
};
sendQueryNTimes = function(query,params,numberOfTimes,onError,callback){
    var tries = 0;
    temp = function(){
        sendQuery( query,params,function(result){
            try{
                if(result["rows"].length > 0)
                    callback(result["rows"]);
                else
                    callback(onError)
            }
            catch(err){
                if(tries < numberOfTimes){
                    tries += 1;
                    temp();
                }
                else{
                    if(callback)
                        callback(onError);
                }
            }
        })
    };
    temp()
}
getClassesWTopic = function (params, table, callback) {
    queryDict = {
        'classes' : 'select distinct * from classes where school = $1 and session = $2',
        'classes_1' : 'select distinct * from classes_2 where school = $1 and session = $2',
    };
    sendQueryNTimes(queryDict[table],params,3,[],callback);
};
getClasses = function(params, callback){
	getClassesWTopic(params,'classes',callback);
};
getTopics = function (params,callback) {
    console.log('in getTopics');
    sendQueryNTimes('select distinct topic from classes_1 where school = $1 and session = $2',params,3,[],callback)
};
getTeacherInfo = function(params,callback){
	sql = "select distinct schools.name as schoolName from schools, session where schools.id = session.school and schools.id = $1";
	sendQuery2(sql, [params[0]], function(data){
	    teacherSQL = "select distinct * from ratemyprofessor where inst like \'%"+ data["schoolname"]  +"%\' and name = $1";
        sendQueryNTimes(teacherSQL, [params[1]], 3, ["No Data"], callback);
	})
};
//testAddDataToTable(function(result){console.log(result)})
