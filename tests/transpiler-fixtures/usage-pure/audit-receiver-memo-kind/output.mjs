import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const out = [];
const _ref = [1, 2];
var at = _atMaybeArray(_ref);
var flat = _flatMaybeArray(_ref);
_pushMaybeArray(out).call(out, typeof at, typeof flat);
var {
  at: at2,
  ...rest
} = [3, 4];
_pushMaybeArray(out).call(out, typeof at2, 'at' in rest);
export { out };