// an identity self-assign (`M = M`) writes the alias's own value back and is a no-op for every
// flow-sensitive walk - for a PATTERN-bound alias exactly as for a plain declarator, so the static
// folds instead of falling to the runtime guard. the name the write is compared against is the
// binding's, which a pattern declarator does not spell in its id
let { Map: M } = globalThis;
M = M;
export const viaObject = M.groupBy(list, fn);
let [A] = [globalThis.Array];
A = A;
export const viaArray = A.from([1]);
