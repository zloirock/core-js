var regExpFlags = require('../internals/regexp-flags');
var UNSUPPORTED_Y = require('../internals/regexp-sticky-helpers').UNSUPPORTED_Y;

// `RegExp.prototype.flags` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
// eslint-disable-next-line es/no-regexp-prototype-flags -- required for testing
if (/./g.flags != 'g' || UNSUPPORTED_Y) {
  // eslint-disable-next-line es/no-object-defineproperty -- safe
  Object.defineProperty(RegExp.prototype, 'flags', {
    configurable: true,
    get: regExpFlags,
  });
}
