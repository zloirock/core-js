// an array wrapper of arity > 1 may be crossed on the walk to the destructure host, but the
// whole-declaration drop is the every-leaf-consumed case only: an unconsumed sibling keeps the
// declaration alive, with the consumed leaf renamed to a sentinel
const [{ Array: { from } }, other] = [globalThis, 1];
const [second, { Map: { groupBy } }] = [2, globalThis];
console.log(other, second, from, groupBy);
