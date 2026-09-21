import _Array$from from "@core-js/pure/actual/array/from";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
(function ({
  from: _unused,
  ...rest
}) {
  let from = _Array$from;
  return [from, rest];
})(Array);