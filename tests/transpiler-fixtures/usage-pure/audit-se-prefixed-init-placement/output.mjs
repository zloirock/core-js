import _Array$from from "@core-js/pure/actual/array/from";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// where the SE PREFIX of an init goes, by CLAIM and by READER COUNT.
// one reader with a dispatch to hold it: the prefix rides that dispatch on babel and lifts to its own
// statement on the other leg - the placement decision each leg makes for a SOLE claim
const sole = _toReversedMaybeArray((effect(), _globalThis.Array.prototype)); // a claim that binds its pure DIRECTLY has no dispatch to hold it, and BOTH legs lift there
effect();
const soleStatic = _Array$from; // SEVERAL readers: the prefix must run ONCE for all of them, so no dispatch may hold it - babel
// memoizes the surface per claim and keeps a sentinel residual, the other leg lifts once and drops
// the residual. same bindings, same imports, one shared run of the effect
effect();
const twoA = _withMaybeArray(_globalThis.Array.prototype);
const twoB = _entriesMaybeArray(_globalThis.Array.prototype);
effect();
const mixedLeaf = _valuesMaybeArray(_globalThis.Array.prototype);
const mixedStatic = _Object$fromEntries; // ... and with a SURVIVING rest the init itself memoizes on this leg (the residual reads that ref),
// while babel lifts the prefix and memoizes the surface
const _ref = (effect(), _globalThis);
const restLeaf = _findLastMaybeArray(_ref.Array.prototype);
const {
  Array: _unused,
  ...restSiblings
} = _ref; // a SHARED declaration splits on both legs: the extraction takes its own declarator
const shared = _findIndexMaybeArray((effect(), _globalThis.Array.prototype));
const sibling = 1;
export { sole, soleStatic, twoA, twoB, mixedLeaf, mixedStatic, restLeaf, restSiblings, shared, sibling };