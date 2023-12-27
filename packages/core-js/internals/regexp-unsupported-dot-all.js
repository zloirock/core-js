'use strict';
var globalThis = require('../internals/global-this');
var fails = require('../internals/fails');

module.exports = fails(function () {
  // babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
  var re = globalThis.RegExp('.', 's');
  return !(re.dotAll && re.test('\n') && re.flags === 's');
});
