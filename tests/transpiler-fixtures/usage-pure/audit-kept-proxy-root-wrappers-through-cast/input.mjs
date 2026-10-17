// Transparent wrappers preserve a kept proxy assignment, its live guard and the collapse of redundant backed hops. The assigned
// runtime value must remain unchanged.
let a;
export const throughCast = ((a = globalThis.window) as any)?.self.Array.prototype.flat.call([1, [2]]);
