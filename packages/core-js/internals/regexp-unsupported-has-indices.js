'use strict';
var fails = require('../internals/fails');
var globalThis = require('../internals/global-this');

// babel-minify and Closure Compiler transpiles RegExp('a', 'd') -> /a/d and it causes SyntaxError
var $RegExp = globalThis.RegExp;

module.exports = fails(function () {
  var re = $RegExp('a', 'd');
  var result = re.exec('ba');
  return !(re.hasIndices && result.indices && result.indices[0][0] === 1 && result.indices[0][1] === 2 && re.flags === 'd');
});
