// a NON-mutated polyfillable builtin in the same nav shape: nothing cancels the claim, so the
// leaf routes through its ponyfill while the guard still binds the undefinable root
let nm;
export const nonMutatedStatic = (nm = globalThis.window)?.self?.self.Map.groupBy([1], x => x);
