import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// A line the user opted out of is not rewritten: a decided selection there keeps its text, and its
// reads are served by nothing this build does - so an alias of it stays undecided where it is used,
// keeping the identity guard the user's own fallback needs.
// core-js-disable-next-line
export const folded = typeof Promise !== 'undefined' ? Promise.try(task) : fallback;
// core-js-disable-next-line
export const sameLine = Symbol || SymbolShim; // core-js-disable-line
// core-js-disable-next-line
const P = typeof Promise !== 'undefined' ? Promise : MyPromise;
export const viaAlias = (P === _Promise ? _Promise$withResolvers : P.withResolvers.bind(P))();
// core-js-disable-next-line
const root = typeof globalThis !== 'undefined' ? globalThis : myRealm;
export const viaRealm = root === _globalThis ? _Map : root.Map;
// core-js-disable-next-line
export const bareLine = (WeakRef || Object).fromEntries(pairs); // core-js-disable-line
// core-js-disable-next-line
const R = FinalizationRegistry ?? Promise;
export const viaBareAlias = (R === _Promise ? _Promise$allSettled : R.allSettled.bind(R))(list);