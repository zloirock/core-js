// an array wrapper of arity > 1 may be crossed on the walk to the destructure host; usage-global
// only adds imports, so both the consumed leaf and the unconsumed sibling stay verbatim
const [{ Array: { from } }, other] = [globalThis, 1];
const [second, { Map: { groupBy } }] = [2, globalThis];
console.log(other, second, from, groupBy);
