import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// A polyfilled optional call (`?.at()` / `?.flat()` / `?.findLast()`), a NON-optional member
// tail (`.x`), then a SURVIVING optional continuation (`?.y`), under an operator / unary / logical
// context. the guard ternary must be parenthesized over the deoptionalized prefix only - the
// surviving `?.y` stays outside the parens - so the operator binds the guarded chain value, not the
// guard's nullish test or its alternate. without the parens `-a == null` flips the guard and the
// success branch calls the method on null (throw), or the operator applies to `void 0` (wrong value).
// distinct methods per line so each injected import maps to its trigger
export function f(a, b, c) {
  const sq = (a == null ? void 0 : _at(a).call(a, -1).x)?.y ** 2;
  const neg = -(b == null ? void 0 : _flatMaybeArray(b).call(b).x)?.y;
  const or = (c == null ? void 0 : _findLastMaybeArray(c).call(c, Boolean).x)?.y || 0;
  return [sq, neg, or];
}