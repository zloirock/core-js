import _Array$from from "@core-js/pure/actual/array/from";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref;
// `Array.from(x).reduce(Array.from)` - same callee twice; outer transform consumes
// leftmost during compose. consumedOccurrencesBefore must subtract that slot from
// rightmost inner's nth or both polyfill insertions land at the same offset
const r = _Array$from(x).reduce(_Array$from, init);
const s = _mapMaybeArray(_ref = _Array$from(x)).call(_ref, _Array$from);