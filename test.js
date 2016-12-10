/*
var sum = [1].reduce((a,b) => {
  console.log('a=' + a);
  console.log('b=' + b);
  return a<b?a:b;});
console.log(sum);
*/
//reduce example
var a = [2, 2, 3];
var gap = a.reduce((prev, cur, index, arr) => {
	console.log('index:' + index);
	var d = arr[index - 1] - cur;
	console.log('d:' + d + ' prev:' + prev);
	return (d < prev) ? d : prev;
});
console.log(gap);

//map example
var fahrenheit = [0, 32, 45, 50, 75, 80, 99, 120];
// ES6
var r = fahrenheit.map(elem => Math.round((elem - 32) * 5 / 9));
console.log(r);

//filter example
//var t0 = Performance.now();
var uniqueArray = [1, 1, 2, 3, 4, 4].filter((elem, index, arr) => arr.indexOf(elem) === index);
console.log(uniqueArray);
//var t1 = Performance.now();
//console.log('elapsed time: ' + (t1-t0) + 'ms');

var n = 5;
for (var i = 1; i <= n; i++) {
	var str = '';
	for (var j = 1; j <= n; j++) {
		str += (j < i) ? '+' : '' + (j - i + 1);
	}
	console.log(str);
}

var str = "abc".toUpperCase().split('');
var t = str.reduce((prev, cur) =>
	prev + cur.charCodeAt(0), 0) / (str.length);
console.log(t);
console.log(String.fromCharCode(t));


var n = 17;

// Write an action using print()
// To debug: printErr('Debug messages...');
for (i = 1; i <= n; i += 2) {
	var str = '';
	for (s = 0; s < (n - i / 2 - n / 2); s++) { // -n/2 positions diamond pattern at left hand edge of page
		str += ' ';
	}
	for (j = 1; j <= i; j++) {
		if (j === 1 || j === i) {
			str += '*';
		} else {
			str += ' ';
		}
	}
	for (k = str.length; k < n; k++) {
		str += ' ';
	}
	console.log(str);
}


for (i = n - 2; i >= 0; i = i - 2) {
	var str = '';
	for (s = 0; s < (n - i / 2 - n / 2); s++) {
		str += ' ';
	}
	for (j = 1; j <= i; j++) {
		if (j === 1 || j === i) {
			str += '*';
		} else {
			str += ' ';
		}
	}
	for (k = str.length; k < n; k++) {
		str += ' ';
	}
	console.log(str);
}

var graph = new Array(5);
for (var i=0; i<graph.length; i++) {
  graph[i] = new Array(5);
  graph[i].fill(0);
}
console.log(graph);

//testing class and inheritance
class Animal {
	constructor (id) {
		this.id = id;
	}
	walk() {
		console.log('Animal ' + this.id + ' walks' );
	}
}

class Cat extends Animal {
	constructor (id, name) {
		super(id);
		this.name = name;
	}
	walk () {
		console.log('Cat ' + this.name + ' walks');
	}
}

var sisi = new Cat ('1', 'sisi');
sisi.walk();
