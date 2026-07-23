// a TS-cast wrapping a chain-assign / proxy-nav guard root: the cast is meaningless after the polyfill swap
// but its operand parens are semantically required, so the guard-root render peels redundant parens yet keeps
// the cast grouped. covers a defined alias root (verdict erase) and an undefinable window root (verdict guard)
// each under an outer instance dispatch. distinct method per line.
let w: any;
let v: any;
const g = globalThis;
export const aliasCast = ((w = g) as any)?.Array.from([1]).at(0);
export const windowCast = ((v = globalThis.window) as any)?.Array.of(5).includes(5);
