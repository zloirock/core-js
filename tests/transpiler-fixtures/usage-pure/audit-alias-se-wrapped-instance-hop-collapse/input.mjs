// An ALIAS of the proxy-global (`const g = globalThis`) navigated through a redundant hop under a SEQUENCE
// (`(c++, g.self).Array.prototype.flat`) must drop the hop and keep the alias name: reading `g.self` off
// engine is undefined (`_globalThis.self` on ie:11 / Node, which throws before the call). babel inlines the
// alias to the pure root while the text emitter keeps `g` (its binding is rewritten to the pure root), so the
// receiver shapes diverge COSMETICALLY (output-unplugin sidecar) - but both drop the dead hop, which is the
// lock. lines vary by nesting depth and hop count; each binds a DISTINCT method and the counters prove order.
const g = globalThis;
let c = 0, d = 0;
const single = (c++, g.self).Array.prototype.flat.call([1, [2]]);
const nested = (c++, (d++, g.self)).Array.prototype.at.call([1], 0);
const doubleHop = (c++, g.self.window).Array.prototype.includes.call([1], 1);
const optional = (c++, (d++, g.self))?.Array.prototype.map.call([1], x => x);
export { single, nested, doubleHop, optional, c, d };
