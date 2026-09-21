import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
export const viaSelfCall = function f({
  from,
  ...rest
} = Array) {
  return _globalThis.recurse ? f(1) : [from, rest];
}();
export const viaEscape = function g({
  of,
  ...rest
} = Array) {
  _globalThis.saved = g;
  return [of, rest];
}();
export const viaParamDefault = function h({
  from,
  ...rest
} = Array, cb = () => h(1)) {
  if (_globalThis.recurse) cb();
  return [from, rest];
}();
export const viaUnnamed = function ({
  from: _unused,
  ...rest
} = Array) {
  let from = _Array$from;
  return [from, rest];
}();
export const viaNamedNoRef = function keep({
  of: _unused2,
  ...rest
} = Array) {
  let of = _Array$of;
  return [of, rest];
}();
export const viaPropKey = function h({
  from: _unused3,
  ...rest
} = Array) {
  let from = _Array$from;
  const table = {
    h: 1
  };
  return [from, rest, table.h];
}();