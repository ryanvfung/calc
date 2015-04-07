/*
 * Title:              SciCalc - Scientific Calculator Module
 * Version:            0.1
 * Author:             Ryan Fung
 * Date created:	   2014-04-16
 * Date last modified: 2015-04-07
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
	nan: /([\+\-\*\/\=\(\)])/g
};
// Regular Expressions, discard search parameters
var red = {
	number: /[0-9]/g,
	letter: /[A-Za-z]/g,
	bracket: /[\(\)]/g,
	operator: /[\+\-\*\/\=]/g,
	nan: /[\+\-\*\/\=\(\)]/g
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

function multiply (num1, num2) {
	return new dim(
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

function add (num1, num2, subtract) {
	if (
		num1.units[0] == num2.units[0] &&
		num1.units[1] == num2.units[1] &&
		num1.units[2] == num2.units[2] &&
		num1.units[3] == num2.units[3] &&
		num1.units[4] == num2.units[4] &&
		num1.units[5] == num2.units[5] &&
		num1.units[6] == num2.units[6]
	) {
		if (!subtract) {
			return new dim(num1.value + num2.value, num1.units);
		} else {
			return new dim(num1.value - num2.value, num1.units);
		}
	} else {
		raiseError('Dimension mismatch');
	}
}

function parseInput(input){ // parse input expression
	var exp = input.split(re.nan);
	
	// convert numbers to object
	for (var i = 0; i < exp.length; i++) {
		if (!(re.nan.test(exp[i]))) {
			exp[i] = new dim(Number(exp[i]), 0);
		}
	}
	
	// perform multiplication
	for (var i = 0; i < exp.length; i++) {
		if (exp[i] == '*' && i > 0 && i < exp.length) {
			exp.splice(i-1, 3, multiply(exp[i-1], exp[i+1]));
			i--;
		}
	}
	
	// perform priority 3 operations
	for (var i = 1; i < exp.length - 1; i++) {
		console.log("exp[i].split(reo[1]).join('')  =  "+String(exp[i].split(reo[3]).join('')));
		if (exp[i].split(reo[3]).join('')=='') {
			// perform addition
			if (exp[i] == '+') {
				console.log('addition');
				exp.splice(i-1, 3, add(exp[i-1], exp[i+1]));
				i--;
			}
			// perform subtraction
			if (exp[i] == '-') {
				console.log('subtraction');
				exp.splice(i-1, 3, add(exp[i-1], exp[i+1], true));
				i--;
			}
		}
		console.log('i  =  '+i);
		console.log('exp[i]  =  '+exp[i]);
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
		var result = parseInput(input);
		console.log(result);
		writeMessage(input + ' = ' + result);
	}
}

function makeNum(id, value, units) {
	dimData[id] = new dim(value,units);
}

function dim(value, units) { // new Dimension
	this.value = value;
	if (units == 0) {
		this.units = [0,0,0,0,0,0,0];
	} else {
		this.units = units;
	}
}
dim.prototype.toString = function () {return String(this.value)};

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
	writeMessage('Error' + msg);
	console.log('Error' + msg);
}