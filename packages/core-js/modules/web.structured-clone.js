var IS_PURE = require('../internals/is-pure');
var $ = require('../internals/export');
var global = require('../internals/global');
var anObject = require('../internals/an-object');
var structuredCloneInternal = require('../internals/structured-clone');

var TypeError = global.TypeError;

$({ global: true, enumerable: true, sham: true, forced: IS_PURE }, {
  structuredClone: function structuredClone(value /* , { transfer } */) {
    var options = arguments.length > 1 ? anObject(arguments[1]) : undefined;
    var transfer = options && options.transfer;

    if (transfer !== undefined) throw new TypeError('Transfer option is not supported');

    return structuredCloneInternal(value);
  }
});
