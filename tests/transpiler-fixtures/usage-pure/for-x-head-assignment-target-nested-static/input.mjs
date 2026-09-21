// a for-x HEAD that declares NOTHING destructures into bindings that already exist, and it still
// holds no statement for an extraction to land in: the iterated ELEMENT is the pattern's only slot,
// so a pattern-valued static leaf takes the same mirror the declaring head takes. a branching
// element mirrors per arm, and an element that is not the constructor keeps the source's own read
let via, span;
const branch = eff();

for ({ of: { name: via } } of [Array, Array]) eff(via);

for ({ of: { name: { length: span } } } of [Array]) eff(span);

for ({ from: { name: via } } of [branch ? Array : { from: { name: 'CUSTOM' } }]) eff(via);

// a claim-free nested level reads the ponyfill the same way
for ({ fromEntries: { length: span } } of [Object]) eff(span);

// ... and an element spelling a plain object declines the whole head
for ({ groupBy: { name: via } } of [{ groupBy: { name: 'CUSTOM' } }]) eff(via);

// The call runs once before the loop binds the nested static.
function make() { eff(); return Array; }
for ({ of: { name: via } } of [make()]) eff(via);
