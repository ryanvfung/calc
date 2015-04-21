/*
 * Title:              SciCalc - Scientific Calculator Module
 * Version:            0.1
 * Author:             Ryan Fung
 * Date created:	   2014-04-16
 * Date last modified: 2015-04-21
 */

var baseUnits = ['kg', 'm', 's', 'A', 'K', 'mol', 'cd'];
var unitData = {}; // global units dataset
var dimData = {}; // global Dimensions dataset

// Regular Expressions, keep search parameters
var re = {
	number: /([0-9])/g,
	letter: /([A-Za-z])/g,
	bracket: /([\(\)])/g,
	operator: /([\+\-\*\/\=])/g,
	nan: /([\+\-\*\/\^\=\(\)])/g
};
// Regular Expressions, discard search parameters
var red = {
	number: /[0-9]/g,
	letter: /[A-Za-z]/g,
	bracket: /[\(\)]/g,
	operator: /[\+\-\*\/\=]/g,
	nan: /[\+\-\*\/\^\=\(\)]/g
};
// Regular Expressions for operations
var reo = {
	1: /[\^]/g,
	2: /[*\/]/g,
	3: /[\+\-]/g
}

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

function parseInput(exp){ // parse input expression

	// perform priority 1 operations
	for (var i = 1; i < exp.length - 1; i++) {
		if (!(exp[i] instanceof dim)) {
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
		if (!(exp[i] instanceof dim)) {
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
		if (!(exp[i] instanceof dim)) {
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
			exp[i] = new dim(Number(exp[i]), 0);
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

function power (num1, num2) {
	if (
		!num2.units[0] &&
		!num2.units[1] &&
		!num2.units[2] &&
		!num2.units[3] &&
		!num2.units[4] &&
		!num2.units[5] &&
		!num2.units[6]
	) {
		console.log(Math.pow(num1.value, num2.value));
		return new dim (
			Math.pow(num1.value, num2.value),
			[
				num1.units[0] * num2.value,
				num1.units[1] * num2.value,
				num1.units[2] * num2.value,
				num1.units[3] * num2.value,
				num1.units[4] * num2.value,
				num1.units[5] * num2.value,
				num1.units[6] * num2.value
			]
		)
	} else {
		raiseError('Cannot raise to power of a dimensioned value');
	}
}

function multiply (num1, num2) {
	return new dim (
		num1.value * num2.value,
		[
			num1.units[0] + num2.units[0],
			num1.units[1] + num2.units[1],
			num1.units[2] + num2.units[2],
			num1.units[3] + num2.units[3],
			num1.units[4] + num2.units[4],
			num1.units[5] + num2.units[5],
			num1.units[6] + num2.units[6]
		]
	);
}

function divide (num1, num2) {
	if ( num2.value != 0 ) {
		return new dim(
			num1.value / num2.value,
			[
				num1.units[0] - num2.units[0],
				num1.units[1] - num2.units[1],
				num1.units[2] - num2.units[2],
				num1.units[3] - num2.units[3],
				num1.units[4] - num2.units[4],
				num1.units[5] - num2.units[5],
				num1.units[6] - num2.units[6]
			]
		);
	} else {
		raiseError('Divide by zero');
	}
}

function add (num1, num2) {
	if (
		num1.units[0] == num2.units[0] &&
		num1.units[1] == num2.units[1] &&
		num1.units[2] == num2.units[2] &&
		num1.units[3] == num2.units[3] &&
		num1.units[4] == num2.units[4] &&
		num1.units[5] == num2.units[5] &&
		num1.units[6] == num2.units[6]
	) {
		return new dim(num1.value + num2.value, num1.units);
	} else {
		raiseError('Dimension mismatch');
	}
}

function subtract (num1, num2) {
	return add(num1, new dim(-num2.value, num2.units));
}

function dim(value, units) { // new Dimension
	this.value = value;
	if (units == 0) {
		this.units = [0,0,0,0,0,0,0];
	} else {
		this.units = units;
	}
	this.equal = function (arg) {
		if (arg instanceof dim) {
			return this.identical(arg);
		} else if (typeof(arg=='number')) {
			return this.value == arg
		}
	}
	this.identical = function (arg) {
		if (arg instanceof dim) {
			return this.identical(dim2);
			if (
				this.value == dim2.value &&
				this.units[0] == dim2.units[0] &&
				this.units[1] == dim2.units[1] &&
				this.units[2] == dim2.units[2] &&
				this.units[3] == dim2.units[3] &&
				this.units[4] == dim2.units[4] &&
				this.units[5] == dim2.units[5] &&
				this.units[6] == dim2.units[6]
				// && this.mag == dim2.mag
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
dim.prototype.toString = function () {return String(this.value)};


function makeNum(id, value, units) {
	dimData[id] = new dim(value,units);
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