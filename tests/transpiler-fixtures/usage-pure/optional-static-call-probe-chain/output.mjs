import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// The static binding is defined, but the earlier window probe still guards the whole chain.
export function optionalTail() {
  var _ref;
  let held;
  const value = null == (held = _globalThis.window) ? void 0 : _atMaybeArray(_ref = _Array$from([effect()]))?.call(_ref, 0);
  return [held, value];
}
export function plainTail() {
  var _ref2;
  return null == _globalThis.window ? void 0 : _atMaybeArray(_ref2 = _Array$of(2)).call(_ref2, 0);
}
export function doubleOptional() {
  var _ref3;
  return null == _globalThis.window ? void 0 : _atMaybeArray(_ref3 = _Array$from([3]))?.call(_ref3, 0);
}
export function computedKey() {
  var _ref4;
  return null == _globalThis.window ? void 0 : _atMaybeArray(_ref4 = (effect(), _Array$from)([4]))?.call(_ref4, 0);
}
// A returned undefined still throws at the next plain member; only the root short-circuits.
export function undefinedValue() {
  var _ref5, _ref6;
  return null == _globalThis.window ? void 0 : _at(_ref5 = _atMaybeArray(_ref6 = _Array$of()).call(_ref6, 0))?.call(_ref5, 0);
}
// Parentheses end the chain, so an absent window makes the outer read throw.
export function sealed() {
  var _ref7;
  return _atMaybeArray(_ref7 = (null == _globalThis.window ? void 0 : _Array$from)?.([1]))?.call(_ref7, 0);
}