import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// passing an explicit `undefined` to a defaulted param TRIGGERS the default (JS coerces it), so
// the param's default type stays authoritative: `r` is the default array and `r.at(0)` keeps the
// array `.at` polyfill. before the fix the `undefined` arg was treated as overriding the default,
// narrowing `r` to undefined and dropping the polyfill.
function f(x = [1, 2, 3]) {
  return x;
}
const r = f(undefined);
_atMaybeArray(r).call(r, 0);