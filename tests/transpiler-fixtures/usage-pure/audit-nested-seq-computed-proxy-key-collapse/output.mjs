import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A NESTED-SEQUENCE side-effecting computed proxy hop key (`globalThis[(e++, (d++, 'self'))].X`) must fold
// to the tail name AND harvest EVERY buried effect in source order, dropping the redundant hop:
// `(e++, d++, _globalThis).Array.prototype`. oxc keeps a `ParenthesizedExpression` between the nested
// sequence levels, so a per-level paren-unwrap is required to recurse past the inner `(d++, 'self')` - a
// bare tail-peel stops at the inner paren and leaves the receiver raw (`_globalThis.self` undefined
// off-engine). multi-type methods on a known prototype prove the type resolves THROUGH the nested fold.
let e = 0,
  d = 0,
  f = 0,
  g = 0;
const arr = _includesMaybeArray((e++, d++, _globalThis).Array.prototype).call([1], 1);
const str = _atMaybeString((f++, g++, _globalThis).String.prototype).call('a', 0);
export { arr, str, e, d, f, g };