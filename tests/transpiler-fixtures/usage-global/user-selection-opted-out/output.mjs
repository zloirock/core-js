import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// In usage-global a line the user opted out of injects nothing, and an alias of its selection read
// elsewhere keeps both operands live: the opted-out read is served by nothing this build does.
// core-js-disable-next-line
export const folded = typeof Promise !== 'undefined' ? Promise.try(task) : fallback;
// core-js-disable-next-line
export const sameLine = Symbol || SymbolShim; // core-js-disable-line
// core-js-disable-next-line
const P = typeof Promise !== 'undefined' ? Promise : MyPromise;
export const viaAlias = P.withResolvers();
// core-js-disable-next-line
const root = typeof globalThis !== 'undefined' ? globalThis : myRealm;
export const viaRealm = root.Map;
// core-js-disable-next-line
export const bareLine = (WeakRef || Object).fromEntries(pairs); // core-js-disable-line
// core-js-disable-next-line
const R = FinalizationRegistry ?? Promise;
export const viaBareAlias = R.allSettled(list);