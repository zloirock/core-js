import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a yield VALUE (TNext-typed) reassigned before the read: the dominating straight-line
// assignment re-narrows the binding, so the dispatch keys on the NEW type - a stale
// TNext-typed Maybe would throw at runtime on the reassigned value
function* gen(): Generator<number, void, number[]> {
  let items = yield 1;
  items = 's';
  use(_atMaybeString(items).call(items, 0));
}
declare function use(x): void;
export const r = gen;