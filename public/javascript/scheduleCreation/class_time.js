class Class_Time{
	constructor(startTime, endTime){
		this.startTime = startTime
		this.endTime = endTime
	}
	getStartTime(){
		return this.startTime
	}
	getEndTime(){
		return this.endTime
	}
	isMorning(){
		return this.getStartTime().lessThenOrEqual(new Time(9,15))
	}
	overlap(b){
		if(this.getStartTime().lessThenOrEqual(b.getStartTime()) && b.getStartTime().lessThenOrEqual(this.getEndTime()))
			return true
		else if(b.getStartTime().lessThenOrEqual(this.getStartTime()) && this.getStartTime().lessThenOrEqual(b.getEndTime()))
			return true
		return false
	}
	lessThen(b){
		return this.getStartTime().lessThen(b.getStartTime)
	}
	lessThenOrEqual(b){
		return this.getStartTime().lessThenOrEqual(b.getStartTime())
	}
	greaterThen(b){
		return this.getStartTime().greaterThen(b.getStartTime())
	}
	greaterThenOrEqual(b){
		return this.getStartTime().greaterThenOrEqual(b.getStartTime())
	}
}
Class_Time.prototype.toString = function(){
	return this.getStartTime().toString + " -> " + this.getEndTime().toString() + " \n "
};
Class_Time.prototype.equals = function(o){
	return this.startTime == other.getStartTime() && self.getEndTime() == other.getEndTime()
}