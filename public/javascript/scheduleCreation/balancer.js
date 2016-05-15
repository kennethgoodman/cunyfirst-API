function* all_subets(totalList, numberOfElements){
	if(numberOfElements > totalList.length)
		throw "cant select more than size"
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
	minmaxSoftScore = -9999999
	topNSchedules = []
	var gen = all_subets(possibleClasses, numberOfElements)
	while( (schedule = gen.next().value ) != undefined){
		schedule = new Schedule(schedule)
		if(hardScoreBreak(schedule)){
			continue
		}
		softScore = findSoftScore(schedule,false,numberOfElements*3)
		schedule.softScore = softScore
		if(topNSchedules.length < 3){
			topNSchedules.push(schedule)
			topNSchedules = topNSchedules.sort(function(a,b){return a.softScore > b.softScore })
			minmaxSoftScore = topNSchedules[0].softScore
			continue
		}
		else if(softScore > minmaxSoftScore){
			topNSchedules = insertIntoListOfSchedules(topNSchedules, schedule)
			minmaxSoftScore = topNSchedules[0].softScore
		}
	}
	return topNSchedules
}

