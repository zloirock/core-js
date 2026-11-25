var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
var _flatMaybeArray = require("@core-js/pure/actual/array/instance/flat");
var _ref, _ref2;
// The optional read is the only CommonJS marker. Both polyfills must use require.
const guard = module?.exports;
consume(guard, _flatMaybeArray(_ref = [1, 2, 3]).call(_ref), _atMaybeArray(_ref2 = ['a', 'b']).call(_ref2, 0));