// In usage-global a line the user opted out of injects nothing, and an alias of its selection read
// elsewhere keeps both operands live: the opted-out read is served by nothing this build does.
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
