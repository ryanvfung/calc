/* Title:              SciCalc - Scientific Calculator Module
 * Version:            0.1
 * Author:             Ryan Fung
 * Date created:	   2014-04-16
 * Date last modified: 2015-04-21
 */
/*global $, siUnits */

$(document).ready(function () {
	$('#scicalcSubmit').on('click', function () {
		checkInput($('#scicalcInput').val());
	});
	$('#scicalcForm').submit(function () {
		// parseInput();
		return false;
	});
	$('#scicalcInput').focus();
	writeMessage('<code>scicalc.js</code> successfully loaded!');
	for (var i in siUnits){
		var a = 0;
		for (var j in siUnits[i][1]) {
			a += j;
		}
		unitData[siUnits[i][0]] = siUnits[i][1];
	}
});

var baseUnits = ['kg', 'm', 's', 'A', 'K', 'mol', 'cd'];
var unitData = {}; // global units dataset
var dimData = {}; // global Dimensions dataset

// Regular Expressions, keep search parameters
var re = {
	n: /([0-9])/g,  // numbers
	l: /([A-Za-z])/g,  // letters
	b: /([\(\)])/g,  // brackets
	o: /([\+\-\*\/\=])/g,  // operators
	nan: /([\+\-\*\/\^\=\(\)])/g,  // NaN: Not a Number
	p: /([pn\u03bcmcdhkMGT])/g // prefixes
};

// Regular Expressions, discard search parameters
var red = {
	n: /[0-9]/g,  // numbers
	l: /[A-Za-z]/g,  // letters
	b: /[\(\)]/g,  // brackets
	o: /[\+\-\*\/\=]/g,  // operators
	nan: /[\+\-\*\/\^\=\(\)]/g,  // NaN: Not a Number
	p: /[pn\u03bcmcdhkMGT]/g // prefixes
};

// Regular Expressions, keep search parameters, single search
var res = {
	l: /([A-Za-z])/,  // letters
};

// Regular Expressions for operations
var reo = {
	1: /[\^]/g,
	2: /[*\/]/g,
	3: /[\+\-]/g
};

function parseInput(exp){ // parse input expression

	// perform priority 1 operations
	for (var i = 1; i < exp.length - 1; i++) {
		if (!(exp[i] instanceof qty)) {
			if (exp[i].split(reo[1]).join('')==='') {
				// perform exponentiation
				if (exp[i] == '^') {
					exp.splice(i-1, 3, power(exp[i-1], exp[i+1]));
					i--;
				}
			}
		}
	}
	
	// perform priority 2 operations
	for (var i = 1; i < exp.length - 1; i++) {
		if (!(exp[i] instanceof qty)) {
			if (exp[i].split(reo[2]).join('')==='') {
				// perform multiplication
				if (exp[i] == '*') {
					exp.splice(i-1, 3, multiply(exp[i-1], exp[i+1]));
					i--;
				}
				// perform division
				if (exp[i] == '/') {
					exp.splice(i-1, 3, divide(exp[i-1], exp[i+1]));
					i--;
				}
			}
		}
	}
	
	// perform priority 3 operations
	for (var i = 1; i < exp.length - 1; i++) {
//		console.log("exp[i].split(reo[1]).join('')  =  "+String(exp[i].split(reo[3]).join('')));
		if (!(exp[i] instanceof qty)) {
			if (exp[i].split(reo[3]).join('')==='') {
				// perform addition
				if (exp[i] == '+') {
					exp.splice(i-1, 3, add(exp[i-1], exp[i+1]));
					i--;
				}
				// perform subtraction
				if (exp[i] == '-') {
					exp.splice(i-1, 3, subtract(exp[i-1], exp[i+1]));
					i--;
				}
			}
		}
//		console.log('i  =  '+i);
//		console.log('exp[i]  =  '+exp[i]);
	}
	
	if(exp.length != 1) {
		raiseError('Not all operations performed on calculation');
		console.log(exp);
	} else {
		return exp[0];
	}
}

function checkInput (input) {
	if ( input.split(/\s/g).join('') !== '' ) {
		var result = processInput(input);
		console.log(result);
		writeMessage(input + ' = ' + result);
	}
}

function processInput (input) {

	// 287 J kg^-1 K^-1   =   qty(287, [1, 2, -2, 0, -1, 0, 0]);
	// =
	// num unit[^int] [*/ unit[^int]]
	// num unit[^int] [* unit[^int]] [/  (unit[^int] [* unit[^int]])]
	
	var exp = input.split(re.nan);
	
	// remove extra array item at start if input string starts with whitespace
	if (exp[0].replace(/\s/g,'') === '' ) {
		exp.shift();
	}
	
	// remove extra array item at end if input string ends with whitespace
	if (exp[exp.length-1].replace(/\s/g,'') === '' ) {
		exp.pop();
	}
	
	// convert numbers to object
	for (var i = 0; i < exp.length; i++) {
		if (!re.nan.test(exp[i])) {
			var split = exp[i].replace(/\s/g,'').split(res.l);
			var units = [0, 0, 0, 0, 0, 0, 0];
			if (split[0]===''){
				split.shift();
			}
			if (split[split.length-1]===''){
				split.pop();
			}
			for (var j = 1; j < split.length; j++) {
				var array = siUnits[split[j]];
				if ( array ) {
					array.forEach( function (e,i,a) { units[i] += e; } );
				}
			}
			exp[i] = new qty(Number(split[0]), units);
		}
	}
	
	// process brackets
	for (var i = 0; i < exp.length; i++ ) {
		if (/\)/g.test(exp[i])) {
			for (var j = i; j > -1; j--) {
				if (/\(/g.test(exp[j])) {
					var subexp = exp.splice(j + 1, i - 1);
					exp.splice(j, 2, parseInput(subexp));
					i--;
					break;
				}
			}
		}
	}
	
	return parseInput(exp);
}

function power (qty1, qty2) {
	if ( qty2.units.every( function (e,i,a) { return e===0; } ) ) {
		var units = [];
		qty1.units.forEach( function (e,i,a) { units.push(e * qty2.value); } );
		return new qty ( Math.pow(qty1.value, qty2.value), units );
	} else {
		raiseError('Cannot raise to power of a dimensioned value');
	}
}

function multiply (qty1, qty2) {
	var units = [];
	qty1.units.forEach( function (e,i,a) { units.push(e + qty2.units[i]); } );
	return new qty ( qty1.value * qty2.value, units );
}

function divide (qty1, qty2) {
	if ( qty2.value !== 0 ) {
		var units = [];
		qty1.units.forEach( function (e,i,a) { units.push(e - qty2.units[i]); } );
		return new qty( qty1.value / qty2.value, units );
	} else {
		raiseError('Divide by zero');
	}
}

function add (qty1, qty2) {
	if ( qty2.units.every( function (e,i,a) { return e===qty2.units[i]; } ) ) {
		return new qty(qty1.value + qty2.value, qty1.units);
	} else {
		raiseError('Dimension mismatch');
	}
}

function subtract (qty1, qty2) {
	return add(qty1, new qty(-qty2.value, qty2.units));
}

function qty(value, units) { // new Dimension
	this.value = value;
	if (units === 0) {
		this.units = [0,0,0,0,0,0,0];
	} else {
		this.units = units;
	}
	this.equal = function (arg) {
		if (arg instanceof qty) {
			return this.identical(arg);
		} else if (typeof(arg=='number')) {
			return this.value == arg;
		}
	};
	this.identical = function (arg) {
		if (arg instanceof qty) {
			if (
				this.value == arg.value &&
				this.units[0] == arg.units[0] &&
				this.units[1] == arg.units[1] &&
				this.units[2] == arg.units[2] &&
				this.units[3] == arg.units[3] &&
				this.units[4] == arg.units[4] &&
				this.units[5] == arg.units[5] &&
				this.units[6] == arg.units[6]
				// && this.mag == arg.mag
			) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};
}
qty.prototype.toString = function () { return String(this.value); };


function makeNum(id, value, units) {
	dimData[id] = new qty(value,units);
}

function ungroup(s) { // extract expression from inside round brackets
	try {
		s = s.split('(')[1].split(')')[0];
	} catch (e) {
	}
	return s;
}

function extractVar(s) { // extract variable name from variable string
	
}

function writeMessage(msg) {
	var element = document.createElement('p');
	element.innerHTML = msg;
	var box = document.getElementById('scicalcOutput');
	if (box.children == 0) {
		box.appendChild(element);
	} else {
		box.insertBefore(element, box.firstChild);
	}
}

function raiseError(msg) {
	writeMessage('Error: ' + msg);
	console.log('Error: ' + msg);
}