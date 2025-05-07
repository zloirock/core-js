'use strict';
var detectCorrectnessOfRegExpFlags = require('./detect-correctness-of-regexp-flags');
var isRegExp = require('./is-regexp');
var getRegExpFlagsImplementation = require('./get-regexp-flags-implementation');

module.exports = detectCorrectnessOfRegExpFlags.correct ? function (it) {
  return it.flags;
} : function (it) {
  return (!detectCorrectnessOfRegExpFlags.correct && isRegExp(it)) ? getRegExpFlagsImplementation(it) : it.flags;
};
