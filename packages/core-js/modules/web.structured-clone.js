var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var structuredCloneImpl = require('../internals/structured-clone');
var WeakMap = getBuiltIn('WeakMap');

$({ global: true, enumerable: true }, {
  structuredClone: function structuredClone(value/* , { transfer } */) {
    var transfer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1].transfer : undefined;

    return structuredCloneImpl(new WeakMap(), value, transfer || []);
  }
});
