function* all_subets(totalList, numberOfElements){
	if(numberOfElements > totalList.length)
		alert("cant select more than number of classes")
	var c = Combinatorics.bigCombination(totalList,numberOfElements)
	while(a = c.next()){
		var d = Combinatorics.cartesianProduct.apply(null, a)
		allElements = d.toArray()
		for(var e in allElements){
			yield allElements[e]
		}
	}
}
insertIntoListOfSchedules =function(schedules, newSchedule){
	schedules.splice(0,1)
	schedules.push(newSchedule)
	return schedules.sort(function(a,b){return a.softScore > b.softScore})
}
balancer = function(possibleClasses,numberOfElements){
	//minmaxSoftScore = -9999999
	schedules = []
	var gen = all_subets(possibleClasses, numberOfElements)
	while( (schedule = gen.next().value ) != undefined){
		schedule = new Schedule(schedule)
		if(!hardScoreBreak(schedule)){
			schedules.push(schedule)
		}
		//softScore = findSoftScore(schedule,false,numberOfElements*3)
		//schedule.softScore = softScore
		//if(true || topNSchedules.length < 3){
		
			//topNSchedules = topNSchedules.sort(function(a,b){return a.softScore > b.softScore })
			//minmaxSoftScore = topNSchedules[0].softScore
		//}
		/*
		else if(softScore > minmaxSoftScore){
			topNSchedules = insertIntoListOfSchedules(topNSchedules, schedule)
			minmaxSoftScore = topNSchedules[0].softScore
		}*/
	}
	return schedules
}

