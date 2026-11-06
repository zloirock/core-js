// A computed key may query a source-only container before its later write.
// The native default reads a static from the substituted constructor.
const arr = [];
const k = String(arr.length);
const { [k]: { groupBy } = Map } = {};
arr.push(groupBy);
export const r = typeof arr[0];
