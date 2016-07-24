class Class_Time{
	constructor(startTime, endTime, day){
		this.startTime = startTime
		this.endTime = endTime
		this.day = day
	}
	getStartTime(){
		return this.startTime
	}
	getEndTime(){
		return this.endTime
	}
	isMorning(){
		return this.getStartTime().lessThanOrEqual(new Time(9,15))
	}
	overlap(b){
		if(this.day != b.day)
			return false
		else if(this.getStartTime().lessThanOrEqual(b.getStartTime()) && b.getStartTime().lessThanOrEqual(this.getEndTime()))
			return true
		else if(b.getStartTime().lessThanOrEqual(this.getStartTime()) && this.getStartTime().lessThanOrEqual(b.getEndTime()))
			return true
		return false
	}
	lessThan(b){
		return this.startTime.lessThan(b.startTime)
	}
	lessThanOrEqual(b){
		return this.getStartTime().lessThanOrEqual(b.getStartTime())
	}
	greaterThan(b){
		return this.getStartTime().greaterThan(b.getStartTime())
	}
	greaterThanOrEqual(b){
		return this.getStartTime().greaterThanOrEqual(b.getStartTime())
	}
}
Class_Time.prototype.toString = function(){
	return this.getStartTime().toString + " -> " + this.getEndTime().toString() + " \n "
};
Class_Time.prototype.equals = function(o){
	return this.startTime == other.getStartTime() && self.getEndTime() == other.getEndTime()
}