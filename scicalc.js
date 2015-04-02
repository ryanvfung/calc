/*
 * Title:              SciCalc - Scientific Calculator Module
 * Version:            0.1
 * Author:             Ryan Fung
 * Date created:       2014-04-16
 * Date last modified: 2014-04-16
 */

var baseUnits = ["kg","m","s","A","K","mol","cd"];
var unitData = {}; // global units dataset
var dimData = {}; // global Dimensions dataset
var scicalcInputListener = $("#scicalcSubmit").addEventListener("click",parseInput);

window.onload=function(){
    var element = document.createElement("p");
    element.innerHTML="<tt>scicalc.js</tt> successfully loaded!";
    document.body.appendChild(element);
    for(i in siUnits){
        var a = 0;
        for(j in siUnits[i][1]){a+=j}
        unitData[siUnits[i][0]] = siUnits[i][1];
    }
}

function makeNum(id,value,units){
    dimData[id] = new dim(value,units);
}

function dim(value,units){ // new Dimension
    this.value = value;
    this.units = units;
}

function parseInput(){ // parse input expression
    var str = $("#scicalcInput").value;
    
}
function ungroup(s){ // extract expression from inside round brackets
    try { s=s.split("(")[1].split(")")[0]; }
    catch (e) {}
    return s;
}
function extractVar(s){ // extract variable name from variable string
    
}