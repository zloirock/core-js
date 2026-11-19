import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// type-param default that refers to an earlier param (`<T = string, U = T>`): when the
// caller overrides T, U resolves to the caller-supplied T, not the declared T.default.
// Default-fallback resolution threads the accumulated subst map so U binds to the
// user-supplied `number[]`, emitting `_atMaybeArray`. Without threading, U would bind
// to T's declared default `string` and a string-shaped polyfill would be emitted instead
function f<T = string, U = T>(t: T): U {
  return t as unknown as U;
}
const result = f<number[]>([1, 2, 3]);
_atMaybeArray(result).call(result, -1);