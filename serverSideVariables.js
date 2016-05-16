/************** common files **************/
require('./database');

/************** common files **************/


/************** Initialization **************/
global.list_of_insts_and_sessions = []
global.counter_for_list_of_insts_and_session = 0
global.dict_of_classes_for_each_school = { "QNS01": { "1169": null, "1162": null } }
global.dict_of_count_for_classes_for_each_school = { "QNS01" :  { "1169": 0, "1162": 0 } }
/************** Initialization **************/


/************** starting values *************/
getInstitutions(function(result){
	global.list_of_insts_and_sessions = result
})
setTimeout( function(){
	getClasses(["QNS01","1169"], function(result){
		global.dict_of_classes_for_each_school["QNS01"]["1169"] = result
	})
},1000*5) //start 5 seconds after start
setTimeout( function(){
	getClasses(["QNS01","1162"], function(result){
		global.dict_of_classes_for_each_school["QNS01"]["1162"] = result
	})
},1000*10) //start 10 seconds later
/************** starting values *************/

/************** getters *****************/
getInstitutionsGlobal = function(callback){
	callback(global.list_of_insts_and_sessions)
	global.counter_for_list_of_insts_and_session++
}
getClassesGlobal = function(params, callback){
	if(params[0] in global.dict_of_classes_for_each_school && params[1] in global.dict_of_classes_for_each_school[params[0]]){
		if(global.dict_of_classes_for_each_school[params[0]][params[1]] == null || global.dict_of_classes_for_each_school[params[0]][params[1]] == undefined){
			getClasses(params, callback)
		}
		else{
			callback(global.dict_of_classes_for_each_school[params[0]][params[1]])
		}
	}
	else{
		getClasses(params, callback)
	}
	
	if(params[0] in global.dict_of_count_for_classes_for_each_school){
		if(params[1] in global.dict_of_count_for_classes_for_each_school[params[0]]){
			global.dict_of_count_for_classes_for_each_school[params[0]][params[1]]++
		}
		else{
			global.dict_of_count_for_classes_for_each_school[params[0]][params[1]] = 1
		}
	}
	else{
		global.dict_of_count_for_classes_for_each_school[params[0]] = { }
		global.dict_of_count_for_classes_for_each_school[params[0]][params[1]] = 1
	}
}

/************** updated variables *****************/
var inst_and_session_interval = setInterval(function() {
	getInstitutions(function(result){
		if(result != []){
			global.list_of_insts_and_sessions = result //else keep it
		}
	})
}, 1000 * 60 * 60) //once an hour


/************* log variables **************/
var loggingVariables = setInterval(function(){
	logger.log("counter_for_list_of_insts_and_session has been called %d times", counter_for_list_of_insts_and_session)
	for(var school in global.dict_of_count_for_classes_for_each_school){
		for(var session in global.dict_of_count_for_classes_for_each_school[school]){
			logger.log("counter_for_list_of_insts_and_session has been called %d times for isnt: %s and session: %s", counter_for_list_of_insts_and_session, school, session)
		}
	}
}, 1000 * 60 * 60)

/************* log variables **************/

