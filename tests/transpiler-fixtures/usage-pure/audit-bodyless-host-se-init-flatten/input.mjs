// Bodyless control statements keep initializer effects and pure bindings under the same guard.
const seen = [];
const eff = t => (seen.push(t), t);
let c = 1;

if (c) var { Array: { from } } = (eff('a'), globalThis);

// array-wrapped twin: the wrapper descent and the block-wrap compose
if (c) var [{ Array: { of } }] = [(eff('b'), globalThis)];

// bodyless loop arm
while (c--) var { Array: { fromAsync } } = (eff('c'), globalThis);

// assignment host on a bodyless slot keeps its own channel
let groupBy;
if (seen.length) ({ Map: { groupBy } } = (eff('d'), globalThis));

export { from, of, fromAsync, groupBy, seen };
