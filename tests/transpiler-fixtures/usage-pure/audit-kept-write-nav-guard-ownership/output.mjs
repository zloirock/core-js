import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// who renders the guard of a proxy nav whose value a user WRITE keeps. each row reaches that render
// through a different channel - a CLAIMLESS read leading none, a claim leading one, a ctor claim
// carrying a TAIL of its own (claim and tail are one atom: split, the tail reads off the
// short-circuited `void 0` or the ctor rides raw off the ponyfilled realm), a STACKED unresolvable
// prefix, and a nav kept twice - and every one of them owes the same guard.
let claimless, leads, computed, proto, stacked, outer, inner, alias, kept, tail, folded;
const key = 'noSuchStatic';

// the write sits BELOW the hops, so the nav's ROOT spells a store and the guard rides the hop above
export const claimlessStatic = null == (claimless = _globalThis).window ? void 0 : _self.noSuchStatic;
export const claimLeads = null == (leads = _globalThis).window ? void 0 : _Number$MAX_SAFE_INTEGER;

// the write sits AROUND the whole nav, with a ctor claim and its tail above it
export const ctorComputedTail = null == (computed = null == _globalThis.window ? void 0 : _self) ? void 0 : _Promise[key];
export const ctorPrototypeTail = null == (proto = null == _globalThis.window ? void 0 : _self) ? void 0 : _Map.prototype.noSuchMethod;

// a STACKED unresolvable prefix: the test reads the DEEPEST one off the collapsed leaf
export const stackedPrefix = (stacked = null == _self.window ? void 0 : _self, _Number$MAX_SAFE_INTEGER);

// the write inside a SEQUENCE, over a root the bare-alias walk leaves unproven: the root question
// is which global the identifier names, and the trusted-write resolver answers it
export const sequenceRoot = null == (alias = _globalThis, kept = null == alias.window ? void 0 : _self) ? void 0 : _Promise.noSuchStatic;

// a hop pure cannot back reading the STORE is the environment probe off it, not a redundant step:
// the run that swallowed it answered the ponyfill where the source reads the host
export const probeOverStore = (tail = null == alias.window ? void 0 : _self)?.window.noSuchStatic;
// ... and a ctor claim over such a store keeps the guard whose test spells that very write
export const ctorOverStore = null == (folded = _globalThis).window ? void 0 : _Promise.noSuchStatic;

// kept TWICE: the inner write holds the bare root, so the outer one carries the navigation
export const doublyKept = null == (outer = null == (inner = _globalThis).window ? void 0 : _self) ? void 0 : _Array$of(3);
export { claimless, leads, computed, proto, stacked, outer, inner, alias, kept, tail, folded };