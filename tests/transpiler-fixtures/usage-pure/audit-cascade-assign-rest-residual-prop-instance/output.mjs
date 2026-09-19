import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
let from, mapped, others;
({
  Array: {
    from
  },
  mapped = _flatMapMaybeArray(_ref = [10]).call(_ref, String),
  ...others
} = _globalThis);
from([11]);
mapped;