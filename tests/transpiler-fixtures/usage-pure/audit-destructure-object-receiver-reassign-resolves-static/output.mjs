import _Array$from from "@core-js/pure/actual/array/from";
// usage-pure: nested object-destructure `const { Arr: { from } } = w` where `w` is reassigned AFTER
// the destructure - at the destructure w.Arr is Array, so `from` is provably Array.from and pure
// collapses to `const from = _Array$from` (polyfill-always-wins) on BOTH plugins; the unplugin flatten
// planner is now flow-sensitive (the receiver write is after the read). mirror of the usage-global counterpart.
let w = {
  Arr: Array
};
const from = _Array$from;
from([1, 2, 3]);
w = {};