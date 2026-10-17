// an update write makes the value unknown - the member widens to the generic helper
var U;
({ Map: U } = globalThis);
U++;
export const r6 = U.flatMap(x => x);
