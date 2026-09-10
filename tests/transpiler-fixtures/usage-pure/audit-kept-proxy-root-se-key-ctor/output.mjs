import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref, _ref2;
// an SE-bearing hop key MIGRATES into the next surviving key when the pristine hop over a kept
// proxy root drops. Where that surviving key names a CONSTRUCTOR the pure package spells, the
// substitution owns it and the migrated effects ride as its PREFIX: respelled computed instead,
// the read lands on the engine slot off the memo - the very slot the ponyfill stands in for, and
// absent on the floor this build targets. The negatives pin the boundary by the KEY: one naming
// no pure ctor keeps its live read off the memo, and one under a hop that never drops keeps both.
let c = 0;
let a;
export const ctorKeyTakesPrefix = null == (a = _globalThis.window) ? void 0 : _nameMaybeFunction((c++, _Set));
let b;
export const secondCtorKey = null == (b = _globalThis.window) ? void 0 : _nameMaybeFunction((c++, _WeakMap));

// the migration reaches a ctor key through the NESTED sequence levels of one key too
let n;
export const nestedKeyLevels = null == (n = _globalThis.window) ? void 0 : _nameMaybeFunction((c++, c++, _Map));

// ... and the same substitution stands with no write to keep - there the drop is the plain
// surface route's, and the prefix rides the ponyfill exactly as it does above
export const noWriteSameSubstitution = null == _globalThis.window ? void 0 : _nameMaybeFunction((c++, _Promise));

// NEGATIVE: `Array` names no pure constructor here, so the surviving key stays a live read off
// the memo and the migrated effects respell it computed - the shape the ctor rows must not take
let d;
export const noCtorKeyRespellsComputed = null == (_ref = d = _globalThis.window) ? void 0 : _nameMaybeFunction(_ref[c++, "Array"]);

// NEGATIVE: no pure ctor AND no kept write - nothing drops, and the hop keeps its own key
export const undroppedHopKeepsItsKey = null == (_ref2 = _globalThis.window) ? void 0 : _nameMaybeFunction((c++, _ref2).Array);

// NEGATIVE: the pristine twin of the first row - nothing to migrate, same substitution
let e;
export const pristineTwin = null == (e = _globalThis.window) ? void 0 : _nameMaybeFunction(_Set);
export { c };