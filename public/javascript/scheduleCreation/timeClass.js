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
		return a.lessThen(b)
	}
	static subtraction(self, other){
		return new Time((self.hour - other.getHour())%24, (self.minute - other.getMinute())%60)
	}
	static addition(self, other){
		return new Time((self.hour + other.getHour())%24, (self.minute + other.getMinute())%60)
	}
	lessThen(other){
		if(this.hour < other.getHour())
			return true
		else if(this.hour == other.getHour())
			return this.minute() < other.getMinute()
		return false
	}
	lessThenOrEqual(other){
		if(this.hour < other.getHour())
			return true
		else if(this.hour == other.getHour())
			return this.minute <= other.getMinute()
		return false
	}
	greaterThen(other){
		if(this.hour > other.getHour())
			return true
		else if(this.hour == other.getHour())
			return this.minute() > other.getMinute()
		return false
	}
	greaterThenOrEqual(other){
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