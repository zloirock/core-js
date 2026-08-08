import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref2;
// `export { _ref as foo }` - user already binds `_ref`. The fresh-name allocator for
// memoized receivers must avoid colliding with the existing user binding, otherwise
// the export silently shadows the polyfill's local. Allocator falls through to `_ref2`
// because export specifier locals are included in the collected binding names
const _ref = [1, 2, 3];
export { _ref as foo };
const x = [4, 5];
const y = _flatMaybeArray(x).call(x);
const z = _atMaybeArray(_ref2 = ['a', 'b']).call(_ref2, 0);
console.log(y, z);