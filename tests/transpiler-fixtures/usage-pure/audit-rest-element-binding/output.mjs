import _Array$from from "@core-js/pure/actual/array/from";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const _ref = Array,
  from = null == _ref ? _ref[""] : _Array$from,
  {
    from: _unused,
    ...Map
  } = _ref;
Map.prototype.get;