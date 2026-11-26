// The update stores a number or bigint. Neither has a standard at or flatMap method.
var U;
({ Map: U } = globalThis);
U++;
U.at(0);
export const r6 = U.flatMap(x => x);
