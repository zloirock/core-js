import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// dotted + computed-string LHS forms in the same file - both must surface their own
// warning so users see one diagnostic per source shape
_globalThis.Map ||= {};
_globalThis['WeakMap'] ||= {};