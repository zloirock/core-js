import _Array$from from "@core-js/pure/actual/array/from";
// A consumed assignment yields its selected receiver and dispatches the named static.
// A caller-supplied object's own slot keeps its value.
export function read(shim) {
  var _ref;
  let from;
  const host = (_ref = shim || Array, from = _ref === Array ? _Array$from : _ref.from, _ref);
  return [host, from];
}