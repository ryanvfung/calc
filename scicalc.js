/*
 * Title:              SciCalc - Scientific Calculator Module
 * Version:            0.1
 * Author:             Ryan Fung
 * Date created:       2014-04-16
 * Date last modified: 2015-04-04
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
 */

var baseUnits = ["kg", "m", "s", "A", "K", "mol", "cd"];
var unitData = {}; // global units dataset
var dimData = {}; // global Dimensions dataset

// Regular Expressions, keep search parameters
var re = {
	number: /([0-9])/g,
	letter: /([A-Za-z])/g,
	bracket: /([\(\)])/g,
	operator: /([\+\-\*\/\=])/g
};
// Regular Expressions, discard search parameters
var red = {
	number: /[0-9]/g,
	letter: /[A-Za-z]/g,
	bracket: /[\(\)]/g,
	operator: /[\+\-\*\/\=]/g
};

window.onload=function(){
	$('#scicalcSubmit').on('click', parseInput);
    var element = document.createElement("p");
    element.innerHTML = "<code>scicalc.js</code> successfully loaded!";
    document.getElementById('scicalcOutput').appendChild(element);
    for(i in siUnits){
        var a = 0;
        for(j in siUnits[i][1]){a+=j}
        unitData[siUnits[i][0]] = siUnits[i][1];
    }
}

function add (num1, num2) {
	// if (sameDimensions) {
		// raiseDimensionError
	// } else {
		return Number(num1) + Number(num2);
	// }
}

function parseInput(){ // parse input expression
    var str = $("#scicalcInput")[0].value;
    var exp = str.split(re.operator);
	for (var i = 0; i < exp.length; i++) {
		console.log(exp[i]);
		if (exp[i] == "+" && i > 0 && i < exp.length) {
			exp.splice(i-1, 3, add(exp[i-1], exp[i+1]));
		}
	}
	if(exp.length != 1) {
		// raiseError("");
		console.log('exp.length:' + exp.length);
		console.log(exp);
	} else {
		result = document.createElement("p");
    	result.innerHTML = str + " = " + exp[0];
		console.log(result.innerHTML);
		document.getElementById('scicalcOutput').appendChild(result);
	}
}

function makeNum(id, value, units){
    dimData[id] = new dim(value,units);
}

function dim(value, units){ // new Dimension
    this.value = value;
    this.units = units;
}

function ungroup(s){ // extract expression from inside round brackets
    try { s=s.split("(")[1].split(")")[0]; }
    catch (e) {}
    return s;
}
function extractVar(s){ // extract variable name from variable string
    
}