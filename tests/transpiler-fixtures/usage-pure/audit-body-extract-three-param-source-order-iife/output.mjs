import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise from "@core-js/pure/actual/promise";
// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.
(function f({
  from: _unused,
  ...r1
} = Array, {
  keys: _unused2,
  ...r2
} = Object, {
  resolve,
  ...r3
} = _Promise) {
  let from = _Array$from;
  let keys = _Object$keys;
  return [from([1]), keys({}), resolve(0), r1, r2, r3];
})();