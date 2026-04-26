import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// for-loop init destructuring a mix of static and instance properties from one
// receiver: each path gets its appropriate pure-mode polyfill alias.
for (const from = _Array$from, at = _atMaybeArray([0]); false;) {
  from([at(0)]);
}