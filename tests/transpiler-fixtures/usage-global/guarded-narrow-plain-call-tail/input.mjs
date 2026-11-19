// A plain call inside a guarded chain must still throw for a missing method.
let R = globalThis;
if (globalThis.__flag !== false) R = { Map: {} };
export const read = () => R?.Map.groupBy([1], x => x);
