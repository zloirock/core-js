import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a NAMED immediately-invoked function whose body references its own name is not called only
// once: the name can re-invoke it with arguments the caller-lossy body-extract never sees, so
// the extract would emit `_Array$from` even where the self-call passed a real argument. the
// receiver stays raw (sound degrade) for a self-call and for a name that ESCAPES the function
export const viaSelfCall = (function f({ from, ...rest } = Array) {
  return _globalThis.recurse ? f(1) : [from, rest];
})();

export const viaEscape = (function g({ of, ...rest } = Array) {
  _globalThis.saved = g;
  return [of, rest];
})();

// a self-reference in a PARAM DEFAULT counts too: the default callback re-invokes the function
// with an argument, so the caller-lossy extract would still be unsound - the receiver stays raw
export const viaParamDefault = (function h({ from, ...rest } = Array, cb = () => h(1)) {
  if (_globalThis.recurse) cb();
  return [from, rest];
})();

// negatives: an UNNAMED IIFE and a NAMED IIFE that never references its own name have a single
// visible call site, so the caller-lossy body-extract stays sound
export const viaUnnamed = (function ({ from: _unused, ...rest } = Array) {
  let from = _Array$from;
  return [from, rest];
})();

export const viaNamedNoRef = (function keep({ of: _unused2, ...rest } = Array) {
  let of = _Array$of;
  return [of, rest];
})();

// a property key matching the function name is a name literal, not a self-reference - extract stays
export const viaPropKey = (function h({ from: _unused3, ...rest } = Array) {
  let from = _Array$from;
  const table = { h: 1 };
  return [from, rest, table.h];
})();