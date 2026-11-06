import _Array$from from "@core-js/pure/actual/array/from";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const _unused = 'used';
const from = _Array$from,
  {
    from: _unused2,
    ...rest
  } = Array;