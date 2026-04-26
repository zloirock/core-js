import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// `export { _ref as foo }` - user already binds `_ref`. plugin's UID generator must NOT
// re-allocate `_ref` for memoized-receiver slots, otherwise the export silently shadows
// the polyfill's local. allocator falls through to `_ref2` because `collectAllBindingNames`
// now picks up `ExportSpecifier.local`
const _ref = [1, 2, 3];
export { _ref as foo };
const x = [4, 5];
const y = _flatMaybeArray(x).call(x);
const z = _atMaybeArray(_ref2 = ['a', 'b']).call(_ref2, 0);
console.log(y, z);