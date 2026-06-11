import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// computed string-key LHS of logical-assign on proxy-global - same read-only binding
// problem as dotted `globalThis.Map ||= ...`. `memberKeyName` resolves the key so the
// gate fires and the warning surfaces with bracket notation matching the source form
_globalThis['Map'] ||= {};
_globalThis[`WeakMap`] ||= {};