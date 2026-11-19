import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// The prefix runs before the constructor fallback tests a realm alias or a bare probe.
// A missing binding still throws there. The computed constructor key belongs to the live arm.
const realm = _globalThis.window;
export const aliased = (first(), null == realm ? void 0 : _WeakMap.mode);
export const bare = typeof (second(), null == window ? void 0 : _Iterator.api);
export const keyed = (missing, third(), null == _globalThis.window ? void 0 : (key(), _Map).label);
export const nested = (first(), missing, second(), null == realm ? void 0 : _WeakMap.mode);