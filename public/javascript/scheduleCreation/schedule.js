class Schedule{
	constructor(listOfClasses){
		this.listOfClasses = listOfClasses
		this.softScore = -999999
	}
	splice(i){
		this.listOfClasses.splice(i,1)
	}
	getSoftScore(){
		return this.softScore
	}
	getListOfClasses(){
		return this.listOfClasses
	}
	setSoftScore(score){
		this.softScore = score
	}
	setClasses(listOfClasses){
		this.listOfClasses = listOfClasses
	}
	sort(){
		this.listOfClasses.sort()
	}
	length(){
		return this.listOfClasses.length()
	}
}
Schedule.prototype.push = function(c){
	this.listOfClasses.push(c)
}
Schedule.prototype.toString = function(){
	return "SoftScore: " + this.softScore.toString() + "\nClassse: " + this.listOfClasses.toString()
}