// nested `Symbol[Symbol.iterator]` LHS of `in` - the inner `Symbol.iterator` resolves
// to the well-known symbol; the outer Symbol-indexed access reads `Symbol[<symbolValue>]`
// which evaluates to undefined at runtime. handleBinaryIn first branch detects double-`.`
// shape (`Symbol.Symbol.iterator`) via `name.includes('.')` guard and bails. The second
// branch (resolveKey-based) sees the resolved string `Symbol.Symbol.iterator` whose
// double-prefix is filtered by `!resolvedLeft.includes('.', 7)`. Both guards prevent
// invalid Symbol.X polyfill dispatch
const a = Symbol[Symbol.iterator] in obj;
const b = Symbol.iterator in arr;
[a, b].includes(true);
