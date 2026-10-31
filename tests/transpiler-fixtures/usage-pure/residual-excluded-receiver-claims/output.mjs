import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Inner symbol claims share the stored guarded receiver with the residual.
// The native capture keeps the store, prefix and receiver read single-evaluated.
let held;
const {
  [_Symbol$iterator]: iterator,
  missing = fallback()
} = (held = (record(), _globalThis.window?.self), held === _globalThis ? _Map : held.Map);
use(held, iterator, missing);

// A fully served static mirror still rejects the stored nullish receiver.
let stored;
const {
  Map: {
    groupBy,
    absent = fallback()
  }
} = ({} = stored = (record(), _globalThis.window?.self), {
  Map: {
    groupBy: _Map$groupBy,
    absent: _Map.absent
  }
});
use(stored, groupBy, absent);

// A fully consumed constructor receiver retains the stored value's throwing read.
let constructor;
const group = ((constructor = (record(), null == _globalThis.window ? void 0 : _Map)).groupBy, _Map$groupBy);
use(constructor, group);