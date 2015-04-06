/*
 * Title:			  SciCalc - Scientific Calculator Module
 * Version:			0.1
 * Author:			 Ryan Fung
 * Date created:	   2014-04-16
 * Date last modified: 2015-04-06
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

window.onload = function() {
	$('#scicalcSubmit').on('click', parseInput);
	$('#scicalcForm').submit(function () {
		// parseInput();
		return false;
	});
	writeMessage('<code>scicalc.js</code> successfully loaded!');
	for(i in siUnits){
		var a = 0;
		for(j in siUnits[i][1]){a+=j}
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

function add (num1, num2) {
	if (num1.units !== num2.units) {
		raiseError('Dimension mismatch');
	} else {
		return new dim(num1.value + num2.value, num1.units);
	}
}

function parseInput(){ // parse input expression
	var str = $('#scicalcInput')[0].value;
	var exp = str.split(re.nan);
	
	// convert numbers to object
	for (var i = 0; i < exp.length; i++) {
		if (!(re.nan.test(exp[i]))) {
			exp[i] = new dim(Number(exp[i]), 0);
		}
	}
	
	console.log(exp);
	
	// perform multiplication
	for (var i = 0; i < exp.length; i++) {
		if (exp[i] == '*' && i > 0 && i < exp.length) {
			exp.splice(i-1, 3, multiply(exp[i-1], exp[i+1]));
			i--;
		}
	}
	
	// perform addition
	for (var i = 0; i < exp.length; i++) {
		if (exp[i] == '+' && i > 0 && i < exp.length) {
			exp.splice(i-1, 3, add(exp[i-1], exp[i+1]));
			i--;
		}
	}
	
	if(exp.length != 1) {
		raiseError('Not all operations performed on calculation');
		console.log('ERROR! exp.length:' + exp.length);
		console.log(exp);
	} else {
		writeMessage(str + ' = ' + exp[0]);
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
	writeMessage(msg);
	console.log(msg);
}