import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// An ALIAS of a proxy-global (`const g = globalThis`) navigating a redundant `.self` / `.window` hop to a
// NON-polyfilled leaf (`g.self.Array`, `g.self.Array.isArray`) has no leaf usage / `kind:'global'` trigger
// to drive the hop collapse - it would strand `g.self.Array` reading an undefined hop off the alias off-
// engine (ie:11 / Node). the hop collapses through the chain root, KEEPING the alias identifier:
// `g.self.Array` -> `g.Array`. covers a dotted hop, a COMPUTED string-literal hop (`g['self']`) and a
// COMPUTED const-binding hop (`g[k]`, k = 'self') - all resolve binding-aware like the collapse itself;
// a ctor, a static, a multi-hop, and a `self` alias. a bare `g.Array` (no hop) and a pure-ctor leaf
// (`g.self.Map`, whole-swapped to `_Map`) are the no-over-collapse controls.
const g = _globalThis;
const named = new g.Array(3);
const checked = g.Array.isArray([1]);
const multiHop = new g.Array(2);
const k = "self";
const computedKey = new g.Array(6);
const computedLiteral = g.Array.isArray([2]);
const s = _self;
const viaSelf = new s.Array(4);
const bareRoot = new g.Array(5);
const pureLeaf = new _Map([['m', 1]]);
export { named, checked, multiHop, computedKey, computedLiteral, viaSelf, bareRoot, pureLeaf };