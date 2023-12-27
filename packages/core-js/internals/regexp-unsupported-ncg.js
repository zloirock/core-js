'use strict';
var globalThis = require('../internals/global-this');
var fails = require('../internals/fails');

module.exports = fails(function () {
  // babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
  var re = globalThis.RegExp('(?<a>b)', 'g');
  return re.exec('b').groups.a !== 'b' ||
    'b'.replace(re, '$<a>c') !== 'bc';
});
