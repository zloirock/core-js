// a flatten whose residual keeps a REBUILT pattern re-emits the init: the detect pass
// suppressed the natural visitor on the init's proxy globals (expecting the emit to own
// them), so the re-emitted tail must route through the same init-globals resolver the flat
// route uses - a raw `globalThis` here is a ReferenceError on engines without the global
const { from, deep: { other } } = globalThis.Array;
use(from, other);

// each operand of a LOGICAL init substitutes the same way in the rebuilt residual
const { of, nested: { more } } = globalThis.Array || Fallback;
use(of, more);

// a symbol-iterator-keyed sibling rides the same rebuilt re-emit; the polyfillable default
// inside its value stays live and the init still substitutes
const { isArray, [Symbol.iterator]: { x = [1].at(0) } } = globalThis.Array;
use(isArray, x);

// the for-init host cannot lift the SE prefix (loop header forbids statements): the sink
// re-embeds `(SE, <tail>)`, and the tail must own the same substitution
for (const { from: ff, deep: { other: oo } } = (eff(), globalThis.Array); cond;) { use(ff, oo); }

// controls: a pure-ctor leaf whole-swaps; a const-alias root keeps the user identifier
const { groupBy, deeper: { rest } } = globalThis.Map;
use(groupBy, rest);
const g = globalThis;
const { keys: k, wrapped: { last } } = g.Object;
use(k, last);
