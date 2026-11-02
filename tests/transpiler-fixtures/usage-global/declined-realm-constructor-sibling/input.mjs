// A retained unknown key must not turn a served constructor sibling into a native read.
// The remaining raw sibling reads the same receiver at its original position.
let key = 'Promise';
const { globalThis: { [key]: { prototype } }, Map: M, missing } = (key = 'Array', globalThis);
new M();
