class Time{
	constructor(hour, minute){
		this.hour = hour;
		this.minute = minute;
	}
	getHour(){
		return this.hour
	}
	getMinute(){
		return this.minute
	}
	static startsBefore(a,b){
		return a.lessThan(b)
	}
	static subtraction(first, second){
		var min = (first.minute - second.getMinute() + 60)%60; //add 60 to get rid of negative numbers
		var hour = 0;
		if((first.minute - second.getMinute()) < 0)
			hour = -1;
		return new Time((first.hour - second.getHour() + hour)%24, min)
	}
	static addition(first, second){
		var min = (first.minute + second.getMinute())%60 //add 60 to get rid of negative numbers
		var hour = 0
		if((first.minute + second.getMinute()) > 60)
			hour = 1
		return new Time((first.hour + second.getHour() + hour), min)
	}
	lessThan(other){
		if(this.hour == null || this.minute == null) return false
		else if(this.hour < other.getHour())  return true
		else if(this.hour == other.getHour()) return this.minute < other.getMinute()
		return false
	}
	lessThanOrEqual(other){
		if(this.hour < other.getHour())
			return true
		else if(this.hour == other.getHour())
			return this.minute <= other.getMinute()
		return false
	}
	greaterThan(other){
		if(this.hour > other.getHour())
			return true
		else if(this.hour == other.getHour())
			return this.minute > other.getMinute()
		return false
	}
	greaterThanOrEqual(other){
		if(this.hour > other.getHour())
			return true
		else if(this.hour == other.getHour())
			return this.minute() >= other.getMinute()
		return false
	}
}
Time.prototype.toString = function(){
	return this.getHour().toString() + ":" + this.getMinute().toString()
}
Time.prototype.equals = function(other){
	return this.hour == other.getHour() && this.minute == other.getMinute()
}