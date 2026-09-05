import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
// a diverging SELECTION element consumed by the sole binding reads once inside the
// dispatch - instance and symbol claims are receiver-based, so the selected VALUE is
// what they read, exactly the native semantics
const at = _at(c ? arr : other);
const it = _getIteratorMethod(c ? arr : other);
export { at, it };

// a STATIC claim is branch-bound - extracting would land the polyfill on the user branch too -
// so the selection mirrors PER BRANCH, the wrapper's element the way a bare init does: the
// polyfill lands in the constructor arm alone and the user arm stays raw
const [{
  from
}] = [c ? {
  from: _Array$from
} : userObj];
export { from };

// ... and an SE-bearing selection rides the MEMO instead of an inline re-spelling: the ref is read
// where native reads the element, so the call runs exactly once and the branch is selected once
const _ref = c ? f() : other;
const viaSe = _at(_ref);
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