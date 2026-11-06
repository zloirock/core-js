// A loop initializer keeps its sequence prefix once inside the header.
// The nested static always receives its pure method before the loop body reads it.
function se() { return globalThis; }
for (const { Array: { from } } = (se(), globalThis); false;) from([]);
