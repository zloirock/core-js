import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
import _WeakSet from "@core-js/pure/actual/weak-set";
const from = _Array$from;
// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
const {
  from: _unused,
  ...rest
} = _globalThis.Array || (cond ? _Set : _Map);
const of = _Array$of;
const {
  of: _unused2,
  ...others
} = _globalThis.Array || (readOnlyFlag, _WeakSet);
export { from, rest, of, others };