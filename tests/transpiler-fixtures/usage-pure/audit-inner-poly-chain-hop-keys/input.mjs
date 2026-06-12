// intermediate call hops between an inner and an outer polyfilled optional call all thread
// into one OR-guard chain. the key matters only for the hop's own POLYFILL lookup: a bare
// identifier and a computed STATIC-STRING key (string literal, template) resolve it; a
// dynamic key threads as a non-poly hop whose raw text re-emits verbatim
export const r1 = arr.flat?.()['map'](f)?.at(0);
export const r2 = arr.flat?.().filter(f)?.at(1);
export const r3 = arr.flat?.()[`slice`](0)?.at(2);
export const r4 = arr.flat?.()[key](f)?.at(3);
// a CONST-bound key resolves through the scope-aware canon like the literal form
const hop = 'map';
export const r5 = arr.flat?.()[hop](f)?.at(4);
// an SE prefix on a poly hop key replays between the receiver memo and the dispatch
export const r6 = arr.flat?.()[(eff(), 'filter')](g)?.at(5);
// an all-NON-poly hop tail threads verbatim: the chain short-circuits through its own
// `?.` tokens and the single outer test covers it
export const r8 = arr.flat?.()?.[eff3(), 'customY'](p)?.at(7);
export const r9 = arr.flat?.()?.cA(p)?.cB(q)?.at(8);
