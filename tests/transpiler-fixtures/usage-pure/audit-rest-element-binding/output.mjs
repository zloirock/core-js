import _Array$from from "@core-js/pure/actual/array/from";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const from = _Array$from,
  {
    from: _unused,
    ...Map
  } = Array;
Map.prototype.get;