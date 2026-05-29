// IIFE returning the global, then a longer chain through `self` (a global alias):
// `(() => globalThis)().self.Map.prototype.has`. Every intermediate link is a recognized
// global alias and the IIFE bottoms out at globalThis, so Map is polyfilled.
const has = (() => globalThis)().self.Map.prototype.has;
new Map().has !== has;
