var worker = require('./worker');
var db = require('./database')

/*(function myLoop (i) {          
   setTimeout(function () {   
      alert('hello');          //  your code here                
      if (--i) myLoop(i);      //  decrement i and call myLoop again if i > 0
   }, 3000)
})(10); */


/*getInst(function(q){
	for (i in q){
		
		setTimeout ( getSession('QNS01', function (r, m){
			console.log(i)
			console.log(m)
			console.log("____________________________")
			console.log("____________________________")
		}), 1000*60)
	}
})*/

allClasses = function (){
	getInst(function(inst){
		var institutionsArray= []
		for (i in inst){
			institutionsArray.push(i)
		}

		allSessions(['QNS01']/*institutionsArray*/, function (array){
			allSubjects (array, function(array1){
				allSections(array1, function(data){
						console.log(Date())
					})
			})
		})
	});
}
console.log(Date())
console.log(escape('insert (%L),', "\'QNS01\'"))
//allClasses()
allSessions = function (institutions, callback){
	var sessionArray= []
	//console.log(institutions)
	var s = function sessionLoop (i) {
		//console.log(i)  
   		setTimeout(function () {   
      		getSession(institutions[--i], function (r, m){
				for (j in m){
					var item = {inst: institutions[i], session: m[j]}
					//console.log(item)
					sessionArray.push(item)
					//console.log("in GS: " + sessionArray)
				}
			})
      		//console.log(i)
			setTimeout( function(){
				if (i>0) sessionLoop(i);      //it's i>-1 because this way it'll try to iterate an extra time before the callback, buying us an extra 3 seconds
   				else {
   					//console.log("IN ST: "+sessionArray)
   					callback(sessionArray)
   				}
			},1000*3.3)              

   		}, 1000*3)
	}; 
	s(institutions.length)
}

allSubjects = function (array, callback){
	//console.log(array)
	if( array == [])
		return;
	var classArray= []
	var s= function sessionLoop (i) {      
   		setTimeout(function () {   
			getDept(array[--i].inst, array[i].session, function (m){
				for (j in m){
					var item = {inst: array[i].inst, session: array[i].session, subject: m[j]}
					//console.log(item)
					classArray.push(item)
				}
			})   
			//console.log(i)
   			setTimeout( function(){
				if (i>0) sessionLoop(i);      //it's i>-1 because this way it'll try to iterate an extra time before the callback, buying us an extra 3 seconds
   				else {
   					callback(classArray)
   				}
			},1000*4) 
   		}, 1000*3)
	}; 
	s(array.length)
}

allSections = function(array, callback){
	//console.log("-----")
	//console.log(array)
	var sectionsArray = []
	var s = function sectionLoop(i){
		setTimeout(function(){
			getSections(array[--i].inst, array[i].session, array[i].subject, function(classData){
				var query = "INSERT INTO CUNYFIRST_Classes (inst, session, dept, classnbr, section, status, instructor, lecture_or_lab) values ";
				for(classNbr in classData){
					for(section in classData[classNbr]){
						query = query + '(%L, %L, %L, %L, %L, %L, %L, %L,),', array[i].inst, array[i].session, array[i].subject, classNbr, section, classData[classNbr][section]["Status"], classData[classNbr][section]["Instructor"], classData[classNbr][section]["Section"].substr(classData[classNbr][section]["Section"].indexOf("-")+1,3))
					}
				}
				console.log(query)
				sendQuery(query.slice(0, -1), [], function(result){
				})
			})
			setTimeout( function(){
				if (i>0) sectionLoop(i);      //it's i>-1 because this way it'll try to iterate an extra time before the callback, buying us an extra 3 seconds
   				else {
   					callback(sectionsArray)
   				}
			},1000*8) 
		}, 1000*4);
	}
	s(array.length)
}
//allClasses()

//getSections('QNS01', '1169', 'PHYS', function (m){
//	console.log(m)
//})