
//Array transpose function
Array.prototype.T = function () {
  return this[0].map((x,i) => this.map(x => x[i]));
}
function nonlin(x, deriv = false) {
  return (deriv) ? x*(1-x) : 1/(1+Math.exp(-x));
}

var seed = 1;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

var X = [[0,0,1],[0,1,1],[1,0,1],[1,1,1]].T();
var y = [[0,1,1,0]].T();

var syn0 = 2*(1+Math.random()*(3-1)) -1;

for (var i =0; i< 10000; i++) {
  var l0 = X;
  l1 = nonlin()
}

//console.log(X[0]);
console.log(nonlin(0));

/*function transpose(m) {
  return m[0].map((x,i) => m.map(x => x[i]));
}*/


