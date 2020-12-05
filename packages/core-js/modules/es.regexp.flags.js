var regExpFlags = require('../internals/regexp-flags');
var fails = require('../internals/fails');

var FORCED = fails(function () {
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  return Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags').get.call({ dotAll: true, sticky: true }) !== 'sy';
});

// `RegExp.prototype.flags` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
if (FORCED) Object.defineProperty(RegExp.prototype, 'flags', {
  configurable: true,
  get: regExpFlags,
});
