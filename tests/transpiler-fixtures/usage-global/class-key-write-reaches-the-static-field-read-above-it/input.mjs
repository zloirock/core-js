// a class evaluates its computed keys before its static field values, so a write in a key reaches a field
// read the source places above it - a receiver alias or a key alias the field reads holds what the key
// stored, and pure keeps the read's candidates rather than the value written before the class. where the
// source order is the evaluation order, the key's write decides on its own
let C;
C = Map;
export class Grouped { static byParity = C.groupBy(xs, x => x % 2); static [(C = Object, 'k')] = 1; }
let K;
K = 'from';
export class Made { static list = Array[K](xs); static [(K = 'of', 'k')] = 1; }
let D;
D = Promise;
export class InOrder { static [(D = Iterator, 'k')] = 1; static lifted = D.from(xs); }
