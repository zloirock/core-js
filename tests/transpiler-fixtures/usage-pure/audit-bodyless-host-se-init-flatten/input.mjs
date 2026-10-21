// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
const seen = [];
const eff = t => (seen.push(t), t);
let c = 1;

if (c) var { Array: { from } } = (eff('a'), globalThis);

if (c) var [{ Array: { of } }] = [(eff('b'), globalThis)];

while (c--) var { Array: { fromAsync } } = (eff('c'), globalThis);

let groupBy;
if (seen.length) ({ Map: { groupBy } } = (eff('d'), globalThis));

export { from, of, fromAsync, groupBy, seen };
