import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A logical destructure init reads its key off the operand the selection yields: a `??` left the build
// decides (`Array`) takes its own static; an unknown left beside a constructor owning the key as a
// static (`Stub ?? Object`) keeps its own read, the static mirrored into the right; `&&` yields its right.
const from = _Array$from;
const {
  keys
} = Stub ?? {
  keys: _Object$keys
};
const {
  entries
} = Array && _Map;