var genev = require('genev');

class Class {
	constructor(id){
		this.id = id
	}
}
var schedule = {
	classes = []
};

// Create a fitness function
var ff = function (genes) {
  var score = 0;

  // In this example,
  // the score will be the sum of the genes
  // so the fittest chromosome shall be the one with the largest genes 
  for(theClass in classes){
  	score += classes[theClass].getClass()
  }

  // the score can be any number (there is no restriction on it's range)
  // as long as the score is proportional to the fitness
  return score;
}

// Use Genev
var myga = genev(chromosome); // set it up with our chromosmoe
myga.initPopulation(); // initialize it
myga.evolve(ff); // let it rip!