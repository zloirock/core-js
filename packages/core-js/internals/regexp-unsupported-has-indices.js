'use strict';
var fails = require('../internals/fails');
var globalThis = require('../internals/global-this');

// babel-minify and Closure Compiler transpiles RegExp('.', 'd') -> /./d and it causes SyntaxError
var $RegExp = globalThis.RegExp;

module.exports = fails(function () {
  var re = $RegExp('.', 'd');
  return !(re.hasIndices && re.exec('abc').indices);
});