// channel: transitive dependent default (U = T) with an opaque earlier param
function makeTransitive<T = number[], U = T>(x: T): U { return x as any; }
makeTransitive('str').includes('s');
