// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
export const viaSelfCall = (function f({ from, ...rest } = Array) {
  return globalThis.recurse ? f(1) : [from, rest];
})();

export const viaEscape = (function g({ of, ...rest } = Array) {
  globalThis.saved = g;
  return [of, rest];
})();

export const viaParamDefault = (function h({ from, ...rest } = Array, cb = () => h(1)) {
  if (globalThis.recurse) cb();
  return [from, rest];
})();

export const viaUnnamed = (function ({ from, ...rest } = Array) {
  return [from, rest];
})();

export const viaNamedNoRef = (function keep({ of, ...rest } = Array) {
  return [of, rest];
})();

export const viaPropKey = (function h({ from, ...rest } = Array) {
  const table = { h: 1 };
  return [from, rest, table.h];
})();
