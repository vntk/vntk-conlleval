const conlleval = require('./conlleval');

let metrics = conlleval.measure_performance('diff.txt');

console.log('diff.txt', metrics);