import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
// a diverging SELECTION element consumed by the sole binding reads once inside the
// dispatch - instance and symbol claims are receiver-based, so the selected VALUE is
// what they read, exactly the native semantics
const at = _at(c ? arr : other);
const it = _getIteratorMethod(c ? arr : other);
export { at, it };

// NEGATIVE: a STATIC claim is branch-bound - extracting would land the polyfill on the
// user branch too, so the selection stays raw
const [{
  from
}] = [c ? Array : userObj];
export { from };

// NEGATIVE: an SE-bearing selection cannot re-spell inline (the call must run exactly
// where the source evaluates it)
const [{
  at: viaSe
}] = [c ? f() : other];
export { viaSe };

// an effect-FREE element of any shape is one read under a SOLE consuming prop - the dispatch
// spells it once, which is what native performs (an optional nav included)
const viaOptional = _at(arr?.inner);
export { viaOptional };

// ... and a TRANSPARENT wrapper around the element is a runtime no-op: the receiver classifies
// through it and the dispatch spells the element AS WRITTEN (a TS cast kept, like the flat
// route's own receiver). an EFFECT-bearing wrapper is a different question - the legs still
// route it through their own prefix channels, tracked in the queue
const viaParens = _at(arr);
export { viaParens };