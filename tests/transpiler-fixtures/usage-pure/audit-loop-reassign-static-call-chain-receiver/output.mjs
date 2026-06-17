import _Array$from from "@core-js/pure/actual/array/from";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
// a static-call result (`Array.from(...)`) feeding a chained instance method, assigned to a
// LOOP-REASSIGNED binding: the receiver is memoized into `_ref`, and the moved receiver must
// still be re-visited so its static polyfill is injected, not left native (regression: babel@8
// re-keys cached ancestor paths lazily after the memo's `var _ref` insert, which once tripped
// the orphan guard and dropped the `Array.from` polyfill)
let p;
for (const _ of [0]) {
  var _ref;
  p = _withMaybeArray(_ref = _Array$from([3, [1, 2]])).call(_ref, 0, 9);
}
export { p };