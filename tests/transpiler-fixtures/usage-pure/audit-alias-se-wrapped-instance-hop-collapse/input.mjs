// An ALIAS of the proxy-global (`const g = globalThis`) navigated through a redundant hop under a SEQUENCE
// (`(c++, g.self).Array.prototype.flat`) must drop the hop and keep the alias name: reading `g.self` off
// engine is undefined (`_globalThis.self` on ie:11 / Node, which throws before the call). babel inlines the
// alias to the pure root while the unplugin keeps `g` (its declaration is rewritten to the pure root), so
// any receiver spelling must preserve the alias value and drop the dead hop, which is
// the lock. the `?.` row keeps its guard: both prefixes run once in its test, while the stable
// ponyfill tail can be read again without a memo. the alias root folds to that leaf in the VALUE
// slot on BOTH legs; only a NAV-position claimless read keeps the alias.
// lines vary by nesting depth and hop count; each binds a DISTINCT method and the counters prove order.
const g = globalThis;
let c = 0, d = 0;
const single = (c++, g.self).Array.prototype.flat.call([1, [2]]);
const nested = (c++, (d++, g.self)).Array.prototype.at.call([1], 0);
const doubleHop = (c++, g.self.window).Array.prototype.includes.call([1], 1);
const optional = (c++, (d++, g.self))?.Array.prototype.map.call([1], x => x);
export { single, nested, doubleHop, optional, c, d };
