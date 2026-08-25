// a diverging SELECTION element consumed by the sole binding reads once inside the
// dispatch - instance and symbol claims are receiver-based, so the selected VALUE is
// what they read, exactly the native semantics
const [{ at }] = [c ? arr : other];
const [{ [Symbol.iterator]: it }] = [c ? arr : other];
export { at, it };

// NEGATIVE: a STATIC claim is branch-bound - extracting would land the polyfill on the
// user branch too, so the selection stays raw
const [{ from }] = [c ? Array : userObj];
export { from };

// NEGATIVE: an SE-bearing selection cannot re-spell inline (the call must run exactly
// where the source evaluates it)
const [{ at: viaSe }] = [c ? f() : other];
export { viaSe };

// an effect-FREE element of any shape is one read under a SOLE consuming prop - the dispatch
// spells it once, which is what native performs (an optional nav included)
const [{ at: viaOptional }] = [arr?.inner];
export { viaOptional };

// ... and a TRANSPARENT wrapper around the element is a runtime no-op: the receiver classifies
// through it and the dispatch spells the element AS WRITTEN (a TS cast kept, like the flat
// route's own receiver). an EFFECT-bearing wrapper is a different question - the legs still
// route it through their own prefix channels, tracked in the queue
const [{ at: viaParens }] = [(arr)];
export { viaParens };
