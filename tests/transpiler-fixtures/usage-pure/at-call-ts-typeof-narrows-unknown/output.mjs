import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// regression: an `unknown` parameter annotation used to suppress type-guard
// narrowing entirely (resolveTypeGuardNarrowing/resolveGuardHints early-return on any
// non-union annotation). expect `_atMaybeString` after the `typeof` narrows `x`.
function f(x: unknown) {
  if (typeof x === 'string') return _atMaybeString(x).call(x, 0);
}