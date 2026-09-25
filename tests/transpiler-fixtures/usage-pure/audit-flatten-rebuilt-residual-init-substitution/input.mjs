// a flatten over a proxy-global init whose residual keeps a NESTED pattern rebuilds the init as a
// literal: the extracted static takes its ponyfill and each kept slot reads the realm constructor
// by its own name - the detect pass suppressed the natural visitor on the init's proxy globals, and
// a raw `globalThis` left behind is a ReferenceError on engines without the global
const { from, deep: { other } } = globalThis.Array;
use(from, other);

// a LOGICAL init whose left operand names the realm constructor folds to it, and the rebuilt
// literal takes its place
const { of, nested: { more } } = globalThis.Array || Fallback;
use(of, more);

// a symbol-iterator-keyed PATTERN sibling extracts through the helper off the shared memo
// (the init substitutes into the memo); the polyfillable default inside the pattern stays live
const { isArray, [Symbol.iterator]: { x = [1].at(0) } } = globalThis.Array;
use(isArray, x);

// the for-init host cannot lift the SE prefix (loop header forbids statements): the sink
// re-embeds `(SE, <tail>)`, and the tail must own the same substitution
for (const { from: ff, deep: { other: oo } } = (eff(), globalThis.Array); cond;) { use(ff, oo); }

// controls: a kept slot of a pure-ctor init reads off the pure constructor; a const-alias root
// folds to the realm, and its kept slot reads the realm constructor by name
const { groupBy, deeper: { rest } } = globalThis.Map;
use(groupBy, rest);
const g = globalThis;
const { keys: k, wrapped: { last } } = g.Object;
use(k, last);
