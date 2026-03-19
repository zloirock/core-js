'use strict';
var FUNCTION_NAME = require('../internals/function-name');
var uncurryThis = require('../internals/function-uncurry-this');

var FunctionPrototype = Function.prototype;
var functionToString = uncurryThis(FunctionPrototype.toString);
var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
var regExpExec = uncurryThis(nameRE.exec);

module.exports = FUNCTION_NAME.EXISTS ? function (it) {
  return it.name;
} : function (it) {
  try {
    return regExpExec(nameRE, functionToString(it))[1];
  } catch (error) {
    return '';
  }
};
