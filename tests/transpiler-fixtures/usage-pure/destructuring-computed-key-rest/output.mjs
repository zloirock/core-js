import _Array$from from "@core-js/pure/actual/array/from";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const key = 'from';
const value = _Array$from,
  {
    "from": _unused,
    ...rest
  } = Array;