'use strict';
var globalThis = require('../internals/global-this');

// A bare RegExp alias can be inlined back to RegExp(...), which Closure Compiler
// and babel-minify can turn into a literal with an already escaped source.
var $RegExp = globalThis.RegExp;

// Some engines escape a line terminator only when it does not follow a backslash.
var source = $RegExp('/\n\r\u2028\u2029\\\n').source;
module.exports = source.charAt(0) === '/' || /[\n\r\u2028\u2029]/.test(source);
