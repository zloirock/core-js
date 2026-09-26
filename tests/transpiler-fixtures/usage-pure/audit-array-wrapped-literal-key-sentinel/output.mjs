import _Array$from from "@core-js/pure/actual/array/from";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const f = _Array$from;
const [{
  'from': _unused,
  ...r
}, o] = [Array, {}];
f([1]);
r;
o;