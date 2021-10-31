var IS_PURE = require('../internals/is-pure');
var $ = require('../internals/export');
var global = require('../internals/global');
var fails = require('../internals/fails');
var anObject = require('../internals/an-object');
var structuredCloneInternal = require('../internals/structured-clone');

var n$StructuredClone = global.structuredClone;
var TypeError = global.TypeError;

var FORCED = IS_PURE || fails(function () {
  // current FF implementation can't clone errors
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1556604
  return n$StructuredClone(Error('a')).message !== 'a';
});

$({ global: true, enumerable: true, sham: true, forced: FORCED }, {
  structuredClone: function structuredClone(value /* , { transfer } */) {
    var options = arguments.length > 1 ? anObject(arguments[1]) : undefined;
    var transfer = options && options.transfer;

    if (transfer !== undefined) {
      if (!IS_PURE && n$StructuredClone) return n$StructuredClone(value, options);
      throw TypeError('Transfer option is not supported');
    }

    return structuredCloneInternal(value);
  }
});
