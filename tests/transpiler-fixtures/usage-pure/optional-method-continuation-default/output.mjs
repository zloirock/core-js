import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Optional method and result guards retain their receiver inside each default evaluation.
export function read(get, argument, value = (() => {
  var _ref, _ref2;
  return null == (_ref = get()) || null == (_ref2 = _at(_ref)?.call(_ref, argument())) ? void 0 : _includes(_ref2).call(_ref2, '2');
})()) {
  return value;
}