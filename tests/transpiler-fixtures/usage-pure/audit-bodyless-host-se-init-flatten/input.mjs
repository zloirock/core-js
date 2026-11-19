// Bodyless hosts keep initializer effects and served bindings under the same guard.
// The array-wrapped static stays native while the direct realm forms extract their methods.
const seen = [];
const eff = t => (seen.push(t), t);
let c = 1;

if (c) var { Array: { from } } = (eff('a'), globalThis);

// The array-wrapped twin keeps its native static read inside the bodyless branch.
if (c) var [{ Array: { of } }] = [(eff('b'), globalThis)];

// bodyless loop arm
while (c--) var { Array: { fromAsync } } = (eff('c'), globalThis);

// assignment host on a bodyless slot keeps its own channel
let groupBy;
if (seen.length) ({ Map: { groupBy } } = (eff('d'), globalThis));

export { from, of, fromAsync, groupBy, seen };
