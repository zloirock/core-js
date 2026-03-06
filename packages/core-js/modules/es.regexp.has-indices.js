'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var UNSUPPORTED_HAS_INDICES = require('../internals/regexp-unsupported-has-indices');
var classof = require('../internals/classof-raw');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var getInternalState = require('../internals/internal-state').get;

var RegExpPrototype = RegExp.prototype;
var $TypeError = TypeError;

// `RegExp.prototype.hasIndices` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.hasIndices
if (DESCRIPTORS && UNSUPPORTED_HAS_INDICES) {
  defineBuiltInAccessor(RegExpPrototype, 'hasIndices', {
    configurable: true,
    get: function hasIndices() {
      if (this === RegExpPrototype) return;
      // We can't use InternalStateModule.getterFor because
      // we don't add metadata for regexps created by a literal.
      if (classof(this) === 'RegExp') {
        return !!getInternalState(this).hasIndices;
      }
      throw new $TypeError('Incompatible receiver, RegExp required');
    }
  });
}
