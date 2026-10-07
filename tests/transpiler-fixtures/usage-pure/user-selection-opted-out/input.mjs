// A line the user opted out of is not rewritten: a decided selection there keeps its text, and its
// reads are served by nothing this build does - so an alias of it stays undecided where it is used,
// keeping the identity guard the user's own fallback needs.
// core-js-disable-next-line
export const folded = typeof Promise !== 'undefined' ? Promise.try(task) : fallback;
export const sameLine = Symbol || SymbolShim; // core-js-disable-line
// core-js-disable-next-line
const P = typeof Promise !== 'undefined' ? Promise : MyPromise;
export const viaAlias = P.withResolvers();
// core-js-disable-next-line
const root = typeof globalThis !== 'undefined' ? globalThis : myRealm;
export const viaRealm = root.Map;
export const bareLine = (WeakRef || Object).fromEntries(pairs); // core-js-disable-line
// core-js-disable-next-line
const R = FinalizationRegistry ?? Promise;
export const viaBareAlias = R.allSettled(list);
