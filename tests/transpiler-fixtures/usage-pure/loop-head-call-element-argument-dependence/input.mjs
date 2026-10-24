// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions.
function pick(value) { return value; }
function constant(tag) { return Array; }
const custom = { from: fallback };
for (const { w: { from } } of [{ w: pick(Array) }, { w: pick(custom) }]) use(from([7]));
for (const { w: { of } } of [{ w: constant('a') }, { w: constant('b') }]) use(of(8));
