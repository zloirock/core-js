'use strict';
var checkCorrectnessOfRegExpFlags = require('../internals/check-correctness-of-regexp-flags');
var detectionOfCorrectnessRegExpFlags = require('../internals/detection-of-correctness-regexp-flags');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var regExpFlags = require('../internals/regexp-flags');

var FORCED = !checkCorrectnessOfRegExpFlags();

// `RegExp.prototype.flags` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
if (FORCED) {
  defineBuiltInAccessor(RegExp.prototype, 'flags', {
    configurable: true,
    get: regExpFlags
  });
  detectionOfCorrectnessRegExpFlags.correct = true;
}
