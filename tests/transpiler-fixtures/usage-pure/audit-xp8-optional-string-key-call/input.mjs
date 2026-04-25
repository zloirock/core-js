// optional access through a string-literal computed key resolves to the same instance
// method as a direct dot access on a typed receiver, so both calls polyfill identically
const arr: number[] | null = null;
const a = arr?.["at"](-1);
const b = arr?.["flat"]();