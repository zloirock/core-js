// a TS-cast wrapping a chain-assign root: the cast is meaningless after the polyfill swap but its operand
// parens are semantically required, so the render peels the redundant ones and keeps the cast grouped
// wherever the root survives. a defined alias root erases (the assign folds into the collapsed receiver),
// an undefinable window root keeps its guard - and that is the row the cast has to stay grouped in.
// each under an outer instance dispatch; distinct method per line
let w: any;
let v: any;
const g = globalThis;
export const aliasCast = ((w = g) as any)?.Array.from([1]).at(0);
export const windowCast = ((v = globalThis.window) as any)?.Array.of(5).includes(5);
