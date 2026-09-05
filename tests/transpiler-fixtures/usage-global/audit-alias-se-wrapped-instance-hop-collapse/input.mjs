// usage-global counterpart: detection must resolve each array-method polyfill THROUGH the SE-wrapped alias
// proxy receiver and inject the side-effect import, keeping the source verbatim (no collapse in the global
// flavor). a regression-guard that an alias hop under a sequence does not hide the consuming instance method.
const g = globalThis;
let c = 0, d = 0;
const single = (c++, g.self).Array.prototype.flat.call([1, [2]]);
const nested = (c++, (d++, g.self)).Array.prototype.at.call([1], 0);
const doubleHop = (c++, g.self.window).Array.prototype.includes.call([1], 1);
const optional = (c++, (d++, g.self))?.Array.prototype.map.call([1], x => x);
export { single, nested, doubleHop, optional, c, d };
