import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";

// An ALIAS of the proxy-global (`const g = globalThis`) navigated through a redundant hop under a SEQUENCE
// (`(c++, g.self).Array.prototype.flat`) must drop the hop and keep the alias name: reading `g.self` off
// engine is undefined (`_globalThis.self` on ie:11 / Node, which throws before the call). A backed
// `.self` keeps the alias. With a further unbacked `.window`, both hops must disappear before the
// call; the surviving base can be the alias or the pure root. The `?.` row keeps its guard:
// both prefixes run once in its test, while the stable
// ponyfill tail can be read again without a memo. the alias root folds to that leaf in the VALUE
// slot on BOTH legs; only a NAV-position claimless read keeps the alias.
// lines vary by nesting depth and hop count; each binds a DISTINCT method and the counters prove order.
const g = _globalThis;

let c = 0, d = 0;
const single = _flatMaybeArray((c++, g).Array.prototype).call([1, [2]]);
const nested = _atMaybeArray((c++, (d++, g)).Array.prototype).call([1], 0);
const doubleHop = _includesMaybeArray((c++, g).Array.prototype).call([1], 1);

const optional = null == (c++, (d++, _self))
	? void 0
	: _mapMaybeArray(_self.Array.prototype).call([1], (x) => x);

export { single, nested, doubleHop, optional, c, d };