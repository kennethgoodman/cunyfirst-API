var Combinatorics = require('js-combinatorics');

function Class(id) {
	this.id = id
}
Class.prototype.getScore = function(){
	return this.id
}
Class.prototype.toString = function(){
	return String(this.id)
}
print = function(obj){
	console.log(obj.toString())
}
a = []
for(var i = 0; i < 5; i++){
	b = []
	for(var j = 0; j < 3; j++){
		b.push(new Class(i*3 + j))
	}
	a.push(b)
}
var c = Combinatorics.bigCombination(a,3)
while(a = c.next()){
	console.log(a)
	var d = Combinatorics.cartesianProduct.apply(null, a)
	console.log(d.toArray())
	break
}

//

//console.log(d.toArray())

