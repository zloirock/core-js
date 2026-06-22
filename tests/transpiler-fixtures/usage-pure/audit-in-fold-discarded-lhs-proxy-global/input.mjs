// the in-fold / symbol-in rewrite DISCARDS the LHS whole (`(globalThis, 'from') in Array` -> `true`;
// `(globalThis, Symbol.iterator) in obj` -> `_isIterable(obj)`): a proxy-global buried in the discarded
// LHS (here a side-effect-free sequence prefix) must be marked skipped, else the text emitter queues a
// `globalThis -> _globalThis` rewrite with no target in the replacement -> compose crash (babel drops the
// subtree by replacing the node). the RHS survives - the fold harvests only its SE, the symbol re-emits
// it verbatim. a POLYFILLABLE side effect in the discarded LHS is rescued (re-emitted with its own
// polyfill, NOT skipped); a buried sequence below a forwarder member is reached and dropped too. covers
// fold key / Symbol.iterator call-shape / a non-iterator symbol in-shape / rescued-SE / buried-SE forwarder
let eff = () => 0;
const obj = {};
export const a = (globalThis, 'from') in Array;
export const b = (globalThis.self, Symbol.iterator) in obj;
export const c = (globalThis, Symbol.asyncIterator) in obj;
export const d = ([1].at(0), 'from') in Array;
export const e = (eff(), globalThis.self).Symbol.iterator in obj;
