import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Nested static and instance leaves in sibling branches both receive pure bindings. A fresh literal
// host and its pristine Array values may be retained or captured without observable effects. The
// ordinary receiver and both source bindings remain intact.
const arr = [1, [2]];
const f = _Array$from;
const m = _flatMaybeArray(arr);
const {
  y: {
    flat: _unused
  }
} = {
  x: Array,
  y: arr
};