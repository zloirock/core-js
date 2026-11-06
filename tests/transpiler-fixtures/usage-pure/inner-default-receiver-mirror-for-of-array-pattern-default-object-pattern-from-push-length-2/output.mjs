import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A loop-head element default and its trailing sibling retain their own array positions.
// The served from leaf handles supplied Array and fallback Array without moving the sibling read.
const out = [];
for (const [{
  from
} = {
  from: _Array$from
}, tail] of [[undefined, 1], [Array, 2]]) (_pushMaybeArray(out) || 0).call(out, from([1]).length + tail);
export { out };