// a nested-param mirror must classify a CONST-ALIASED proxy receiver from its resolved binding, not the
// raw AST identifier: `const NS = globalThis` makes `NS` a proxy, so `{ Array: { from } }` mirrors to
// `{ Array: { from: _Array$from } }` instead of stranding `from` on a native read off the alias. the
// receiver descriptor already dereferences the alias - the mirror context must agree with it
const NS = globalThis;
function f({ Array: { from } } = NS) { return from; }
export const r = f();
