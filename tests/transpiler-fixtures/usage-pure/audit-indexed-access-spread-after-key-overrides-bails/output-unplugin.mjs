import _at from "@core-js/pure/actual/instance/at";
// resolveObjectLiteralProperty forward-iterated and returned the FIRST matching key,
// ignoring that a later SpreadElement could override it. with the bug, T['k'] resolved
// to the literal `[1,2,3]` even though `...spread` runs after and may inject a different
// `k` value (e.g. a string). expected: bail out so the generic polyfill emits, since the
// literal type is not statically guaranteed
declare const spread: { k: string };
function pick<T extends { k: unknown }>(o: T): T['k'] {
  return o.k;
}
const r = pick({ k: [1, 2, 3], ...spread });
_at(r).call(r, -1);