/*
 * Title:              SciCalc - Scientific Calculator Module
 * Version:            0.1
 * Author:             Ryan Fung
 * Date created:	   2014-04-16
 * Date last modified: 2015-04-21
 */


window.onload = function() {
	$('#scicalcSubmit').on('click', function () {
		checkInput($('#scicalcInput').val());
	});
	$('#scicalcForm').submit(function () {
		// parseInput();
		return false;
	});
	$('#scicalcInput').focus();
	writeMessage('<code>scicalc.js</code> successfully loaded!');
	for(i in siUnits){
		var a = 0;
		for (j in siUnits[i][1]) {
			a += j;
		}
		unitData[siUnits[i][0]] = siUnits[i][1];
	}
}

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

// Regular Expressions for operations
var reo = {
	1: /[\^]/g,
	2: /[*\/]/g,
	3: /[\+\-]/g
}

function parseInput(exp){ // parse input expression

	// perform priority 1 operations
	for (var i = 1; i < exp.length - 1; i++) {
		if (!(exp[i] instanceof qty)) {
			if (exp[i].split(reo[1]).join('')=='') {
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
			if (exp[i].split(reo[2]).join('')=='') {
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
			if (exp[i].split(reo[3]).join('')=='') {
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

	// 287 J kg^-1 K^-1
	// num unit[^int] [*/ unit[^int]]
	// num unit[^int] [* unit[^int]] [/  (unit[^int] [* unit[^int]])]
	
	var exp = input.split(re.nan);
	
	// remove extra array item at start if input string starts with something that is not a number
	if (exp[0].split(re.nan).join('') === '' ) {
		exp.shift();
	}
	
	// remove extra array item at end if input string ends with something that is not a number
	if (exp[exp.length-1].split(re.nan).join('') === '' ) {
		exp.pop();
	}
	
	// convert numbers to object
	for (var i = 0; i < exp.length; i++) {
		if (!re.nan.test(exp[i])) {
			exp[i] = new qty(Number(exp[i]), 0);
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
	if (
		!qty2.units[0] &&
		!qty2.units[1] &&
		!qty2.units[2] &&
		!qty2.units[3] &&
		!qty2.units[4] &&
		!qty2.units[5] &&
		!qty2.units[6]
	) {
		return new qty (
			Math.pow(qty1.value, qty2.value),
			[
				qty1.units[0] * qty2.value,
				qty1.units[1] * qty2.value,
				qty1.units[2] * qty2.value,
				qty1.units[3] * qty2.value,
				qty1.units[4] * qty2.value,
				qty1.units[5] * qty2.value,
				qty1.units[6] * qty2.value
			]
		);
	} else {
		raiseError('Cannot raise to power of a dimensioned value');
	}
}

function multiply (qty1, qty2) {
	return new qty (
		qty1.value * qty2.value,
		[
			qty1.units[0] + qty2.units[0],
			qty1.units[1] + qty2.units[1],
			qty1.units[2] + qty2.units[2],
			qty1.units[3] + qty2.units[3],
			qty1.units[4] + qty2.units[4],
			qty1.units[5] + qty2.units[5],
			qty1.units[6] + qty2.units[6]
		]
	);
}

function divide (qty1, qty2) {
	if ( qty2.value != 0 ) {
		return new qty(
			qty1.value / qty2.value,
			[
				qty1.units[0] - qty2.units[0],
				qty1.units[1] - qty2.units[1],
				qty1.units[2] - qty2.units[2],
				qty1.units[3] - qty2.units[3],
				qty1.units[4] - qty2.units[4],
				qty1.units[5] - qty2.units[5],
				qty1.units[6] - qty2.units[6]
			]
		);
	} else {
		raiseError('Divide by zero');
	}
}

function add (qty1, qty2) {
	if (
		qty1.units[0] == qty2.units[0] &&
		qty1.units[1] == qty2.units[1] &&
		qty1.units[2] == qty2.units[2] &&
		qty1.units[3] == qty2.units[3] &&
		qty1.units[4] == qty2.units[4] &&
		qty1.units[5] == qty2.units[5] &&
		qty1.units[6] == qty2.units[6]
	) {
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
	if (units == 0) {
		this.units = [0,0,0,0,0,0,0];
	} else {
		this.units = units;
	}
	this.equal = function (arg) {
		if (arg instanceof qty) {
			return this.identical(arg);
		} else if (typeof(arg=='number')) {
			return this.value == arg
		}
	}
	this.identical = function (arg) {
		if (arg instanceof qty) {
			return this.identical(qty2);
			if (
				this.value == qty2.value &&
				this.units[0] == qty2.units[0] &&
				this.units[1] == qty2.units[1] &&
				this.units[2] == qty2.units[2] &&
				this.units[3] == qty2.units[3] &&
				this.units[4] == qty2.units[4] &&
				this.units[5] == qty2.units[5] &&
				this.units[6] == qty2.units[6]
				// && this.mag == qty2.mag
			) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
}
qty.prototype.toString = function () {return String(this.value)};


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
	element = document.createElement('p');
	element.innerHTML = msg;
	box = document.getElementById('scicalcOutput');
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