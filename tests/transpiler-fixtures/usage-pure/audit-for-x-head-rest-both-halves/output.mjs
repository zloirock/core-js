import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const seen = [];
for (var _ref of [Array]) {
  var from = _Array$from;
  var {
    from: _unused,
    ...staticRest
  } = _ref;
  _pushMaybeArray(seen).call(seen, typeof from, 'from' in staticRest);
}
for (var _ref2 of [[1, 2]]) {
  var {
    at,
    ...instanceRest
  } = _ref2;
  _pushMaybeArray(seen).call(seen, typeof at, 'at' in instanceRest);
}
export { seen };