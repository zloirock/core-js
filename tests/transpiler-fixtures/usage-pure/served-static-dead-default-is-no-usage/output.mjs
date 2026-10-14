import _Array$from from "@core-js/pure/actual/array/from";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref;
// A default on a static the build serves never runs: pure drops it with the rewrite, off the constructor,
// an alias of it and in an assignment, and keeps it as written inside a realm key's mirror - nothing it
// reads imports. A receiver selecting a constructor without the static may run it, and what it reads imports.
const A = Array;
const from = _Array$from;
const of = _Array$of;
const {
  Object: {
    entries = [].toReversed()
  }
} = {
  Object: {
    entries: _Object$entries
  }
};
let hasOwn;
hasOwn = _Object$hasOwn;
const {
  groupBy = _withMaybeArray(_ref = []).call(_ref, 0, 1)
} = flag ? {
  groupBy: _Map$groupBy
} : _WeakMap;
export { from, of, entries, hasOwn, groupBy };