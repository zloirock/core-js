// A head element built by a CALL answers for every pass only where the arguments answer alike: a
// callee can hand its own argument back, so a constructor beside a user object parts the passes and
// the leaf keeps its runtime guard. Primitive arguments carry no claim of their own, so a callee
// reached under them reads the same value each pass and its leaf extracts once.
function pick(value) { return value; }
function constant(tag) { return Array; }
const custom = { from: fallback };
for (const { w: { from } } of [{ w: pick(Array) }, { w: pick(custom) }]) use(from([7]));
for (const { w: { of } } of [{ w: constant('a') }, { w: constant('b') }]) use(of(8));
