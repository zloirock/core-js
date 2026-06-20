import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// a globalThis logical-assign whose computed key is a const string (`globalThis[k] ||= ...` with
// `const k = "Map"`) names the same slot as `globalThis.Map ||= ...`: usage-pure pins the slot's
// pristine constructor entry up front so later core-js modules initialize from the real built-in
const k = "Map";
_globalThis[k] ||= {};