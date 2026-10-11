// a write the next unconditional one overwrites before a closure is created is no value the closure reads:
// the identity guard over the values it may read leaves that write's constructor out, while a write after
// the closure stays one of them
let C = Iterator;
C = Object;
C = Map;
export const read = () => C.groupBy([1], x => x);
C = Set;
