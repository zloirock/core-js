import _Array$from from "@core-js/pure/actual/array/from";
// Receiver effects precede the computed key and write; custom values remain native.
export function read(shim, effect, target) {
  var _ref;
  return _ref = (effect(), shim || Array), null == _ref ? _ref[""] : (effect(), target.value = _ref === Array ? _Array$from : _ref.from), _ref;
}