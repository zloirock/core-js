// `o?.a` short-circuits to undefined (no throw) when o is null, so `??` may yield the
// string fallback: the member result is marked and must dispatch generically, not
// through an array-Maybe
declare const o: { a: number[] } | null;
(o?.a ?? 'fallback').at(0);
