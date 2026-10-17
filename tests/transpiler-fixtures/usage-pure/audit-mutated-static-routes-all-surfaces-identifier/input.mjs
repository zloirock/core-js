// A nested realm destructure observes a later write to its selected static.
const { Map: { set: setAlias } } = globalThis;
Map.set = setPatch;
export const r9 = setAlias;
