import _Map from "@core-js/pure/actual/map/constructor";
// IIFE returning the global, then a longer chain through `self` (a global alias):
// `(() => globalThis)().self.Map.prototype.has`. Every intermediate link is a recognized
// global alias and the IIFE bottoms out at globalThis, so Map is polyfilled.
const has = _Map.prototype.has;
new _Map().has !== has;