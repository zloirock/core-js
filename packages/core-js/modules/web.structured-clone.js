var IS_PURE = require('../internals/is-pure');
var $ = require('../internals/export');
var global = require('../internals/global');
var getBuiltIn = require('../internals/get-built-in');
var anObject = require('../internals/an-object');
var structuredCloneImpl = require('../internals/structured-clone');

var Map = getBuiltIn('Map');
var TypeError = global.TypeError;

$({ global: true, enumerable: true, sham: true, forced: IS_PURE }, {
  structuredClone: function structuredClone(value /* , { transfer } */) {
    var options = arguments.length > 1 ? anObject(arguments[1]) : undefined;
    var transfer = options && options.transfer;

    if (transfer !== undefined) throw new TypeError('Transfer option is not supported');

    return structuredCloneImpl(new Map(), value);
  }
});
