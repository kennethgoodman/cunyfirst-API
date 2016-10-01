
var worker = require('./worker');
var pg = require('pg');
require('./database')
//var database_URL = "postgres://postgres@localhost/cuny_first_db";
pg.defaults.poolIdleTimeout = 2000;
var logger = require('tracer').console({
                  format : [ "<{{title}}> {{file}}:{{line}}: {{message}}", 
                    {
                      error: "<{{title}}> {{file}}:{{line}}: {{message}} \nCall Stack: {{stack}}"
                    }
                    ],
                  preprocess: function(data){ data.title = data.title.toUpperCase()}
              })
global.logger = logger

/*(function myLoop (i) {          
   setTimeout(function () {   
      alert('hello');          //  your code here                
      if (--i) myLoop(i);      //  decrement i and call myLoop again if i > 0
   }, 3000)
})(10); */


/*getInst(function(q){
	for (i in q){
		
		setTimeout ( getSession('QNS01', function (r, m){
			logger.log(i)
			logger.log(m)
			logger.log("____________________________")
			logger.log("____________________________")
		}), 1000*60)
	}

})*/

allClasses = function (callback){
	/*getInst(function(inst){
		var institutionsArray= []
    var institutionsArray2= []
		for (i in inst){
      institutionsArray.push(inst[i])
      institutionsArray2.push({id: inst[i], name: i})
		}*/
    
    institutionsArray = ['QNS01']
		allSessions(institutionsArray, function (array){
			allSubjects(array, function(array1){
				allSections(array1, function(array2){
          callback (array2)
				})
			})
		//})
	});
}
allSessions = function (institutions, callback){
	var sessionArray= []
	var s= function sessionLoop (i) {      
   		setTimeout(function () { 
      		getSession(institutions[--i], function (r, m){
    				for (j in m){
              var item = {inst: institutions[i], session: m[j], name:j}
    					sessionArray.push(item)
    				}
			})              
   			if (i>-1) sessionLoop(i);      //it's i>-1 because this way it'll try to iterate an extra time before the callback, buying us an extra 3 seconds
   			else if( sessionArray.length ) callback(sessionArray)
   		}, 1000*8)
	}; 
	s(institutions.length)
}


allSubjects = function (array, callback){
	var classArray= []
	var s= function sessionLoop (i) {      
   		setTimeout(function () {   
   			if (i>0){
   				getDept(array[--i].inst, array[i].session, function (m){
  					 for (j in m){
  					 	  var item = {inst: array[i].inst, session: array[i].session, subject: m[j], subject_name: j}
  					   	classArray.push(item)
  					 }
				  })   
   			} 
   			else{
   				i--
   			} 
   			if (i>-1) sessionLoop(i);      //it's i>-1 because this way it'll try to iterate an extra time before the callback, buying us an extra 3 seconds
   			else callback(classArray)
   		}, 1000*8)
	}; 
	s(array.length)
}

allSections = function(array, callback){
  var sectionsArray = []
  var s = function sectionLoop(i){
    setTimeout(function(){
      getSections(array[--i].inst, array[i].session, array[i].subject, function(classData){
        for(classNbr in classData){
            for (c in classData[classNbr]){
            	var data = classData[classNbr][c]
            	var tmp= array[i]
            	for (d in data){
            		if(data[d] === undefined || data[d] === "<br />")
                  data[d] = "";
                tmp[d] = data[d]
            	}
              var classInfo = tmp
              if(classInfo["Class Title"] === undefined)
                continue
              classInfo["Class Title"] = classInfo["Class Title"].split("\n").join("").split("\t").join("").split("<br />").join(" ").split("\r").join(" ")
              classInfo.Topic = classInfo.Topic.split("\n").join("").split("\t").join("").split("<br />").join(" ").split("\r").join(" ")
              params = [ {
                    "inst"        : classInfo.inst,
                    "session"     : classInfo.session, 
                    "dept"        : classInfo.Dept,
                    "classNbr"    : classNbr,
                    "section"     : classInfo.Section,
                    "title"       : classInfo["Class Title"], 
                    "days_and_times" : classInfo['Days & Times'], 
                    "Status"      : classInfo.Status==('Open'),
                    "topic"       : classInfo.Topic,
                    "room"        : classInfo.Room,
                    "meeting_dates": classInfo['Dates'], 
                    "teacher"     : classInfo.Instructor, 
                    "labLec"   : classInfo[ "className" ], // lab or lec  
                    }]
              sectionsArray.push(params)
           }
        }
      })
      if (i > 0) sectionLoop(i);      //it's i>-1 because this way it'll try to iterate an extra time before the callback, buying us an extra 3 seconds
      else {
        logger.log("we're up to here")
        callback(sectionsArray)
      }
    },1000*8);
  }
  s(array.length)
}

putInDatabase = function (client, params, a, outOf){
  paramas= params.slice()
  var classNum = [ paramas[4] ]
  logger.log('class num is ')
  logger.log(classNum)
  logger.log('we dealing with '+a+' out of '+outOf )
  client.query("INSERT INTO classes VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)", paramas, function(err, result) {
    if(err) {
       err["Error"] = true;
       logger.error('error running query2', err);
    }
  })
}
allInst = function(callback){
    getInst(function(institutions){
        callback(Object.keys(institutions).map(function(key){ return institutions[key] }))
    })  
}
updateAllSessions = function(table){
  allInst(function(institutions){
      allSessions(institutions, function(sessionArray){
          logger.log(sessionArray)
          var q = "INSERT INTO " + table + " (name, id, school) values \n("
          for(var index = 0; index < sessionArray.length - 1; index++){
              var item = sessionArray[index]
              q += "\'" + item.name + "\', \'" + item.session + "\', \'" + item.inst + "\' ), ("
          }
          q = q.substring(0, q.lastIndexOf(","))
          logger.log(q)
      })
  })
}
allClasses( function(a){
  var q = "INSERT INTO newClasses (inst, session, dept, classNbr, section, title, days_and_times, open, topic, room, meeting_dates, teacher, lablec) values ("
  logger.log(a[0])
  logger.log(a[0][0])
  for(var i in a){
    var obj = a[i][0]
    if(obj !== undefined)
      q += "\'" + obj.inst + "\', \'" + obj.session + "\', \'" + obj.dept + "\', \'" + obj.classNbr + "\', \'" + obj.section + "\', \'" + obj.title + "\', \'" + obj.days_and_times
         + "\'," + obj.Status + ", \'" + obj.topic + "\', \'" + obj.room + "\', \'" + obj.meeting_dates +  "\', \'" + obj.teacher +  "\', \'" + obj.labLec + "\'), ("
  }
  q = q.substring(0, q.lastIndexOf(","))
  sendQuery(q,[],function(result){
    logger.log(result)
  })
})
//updateAllSessions()

//getSections('QNS01', '1169', 'PHYS', function (m){
//	logger.log(m)
//})


