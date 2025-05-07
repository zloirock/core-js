'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var detectCorrectnessOfRegExpFlags = require('../internals/detect-correctness-of-regexp-flags');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var regExpFlags = require('../internals/regexp-flags');

var FORCED = DESCRIPTORS && !detectCorrectnessOfRegExpFlags.correct;

// `RegExp.prototype.flags` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
if (FORCED) {
  defineBuiltInAccessor(RegExp.prototype, 'flags', {
    configurable: true,
    get: regExpFlags
  });
  detectCorrectnessOfRegExpFlags.correct = true;
}
