// An ALIAS of a proxy-global (`const g = globalThis`) navigating a redundant `.self` / `.window` hop to a
// NON-polyfilled leaf (`g.self.Array`, `g.self.Array.isArray`) has no leaf usage / `kind:'global'` trigger
// to drive the hop collapse - it would strand `g.self.Array` reading an undefined hop off the alias off-
// engine (ie:11 / Node). the hop collapses through the chain root, KEEPING the alias identifier:
// `g.self.Array` -> `g.Array`. covers a dotted hop, a COMPUTED string-literal hop (`g['self']`) and a
// COMPUTED const-binding hop (`g[k]`, k = 'self') - all resolve binding-aware like the collapse itself;
// a ctor, a static, a multi-hop, and a `self` alias. a bare `g.Array` (no hop) and a pure-ctor leaf
// (`g.self.Map`, whole-swapped to `_Map`) are the no-over-collapse controls.
const g = globalThis;
const named = new g.self.Array(3);
const checked = g.self.Array.isArray([1]);
const multiHop = new g.self.window.Array(2);
const k = "self";
const computedKey = new g[k].Array(6);
const computedLiteral = g["self"].Array.isArray([2]);
const s = self;
const viaSelf = new s.window.Array(4);
const bareRoot = new g.Array(5);
const pureLeaf = new g.self.Map([['m', 1]]);
export { named, checked, multiHop, computedKey, computedLiteral, viaSelf, bareRoot, pureLeaf };