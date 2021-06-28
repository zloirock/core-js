var UNSUPPORTED_DOT_ALL = require('../internals/regexp-unsupported-dot-all');
var getInternalState = require('../internals/internal-state').get;

var RegExpPrototype = RegExp.prototype;

// `RegExp.prototype.dotAll` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.dotall
if (UNSUPPORTED_DOT_ALL) {
  // eslint-disable-next-line es/no-object-defineproperty -- safe
  Object.defineProperty(RegExpPrototype, 'dotAll', {
    configurable: true,
    get: function () {
      if (this === RegExpPrototype) return undefined;
      // We can't use InternalStateModule.getterFor because
      // we don't add metadata for regexps created by a literal.
      if (this instanceof RegExp) {
        return !!getInternalState(this).dotAll;
      }
      throw TypeError('Incompatible receiver, RegExp required');
    },
  });
}
