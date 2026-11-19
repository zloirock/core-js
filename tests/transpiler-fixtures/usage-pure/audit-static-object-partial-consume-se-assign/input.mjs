// A literal-wrapper assignment keeps its original native static and sibling reads.
// The initializer prefix remains in place and runs once.
const wrapper = { Array, other: 1 };
let from, other;
({ Array: { from }, other } = (log(), wrapper));
