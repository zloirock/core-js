// 7.2.8 IsRegExp(argument)
var isObject = require('core-js-internals/is-object');
var cof = require('core-js-internals/classof-raw');
var MATCH = require('./_wks')('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};
