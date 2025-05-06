'use strict';
var detectionOfCorrectnessRegexpFlags = require('./detection-of-correctness-regexp-flags');
var isRegExp = require('./is-regexp');
var getRegExpFlagsImplementation = require('./regexp-get-flags');

module.exports = detectionOfCorrectnessRegexpFlags.correct ? function (it) {
  return it.flags;
} : function (it) {
  return (!detectionOfCorrectnessRegexpFlags.correct && isRegExp(it)) ? getRegExpFlagsImplementation(it) : it.flags;
};
