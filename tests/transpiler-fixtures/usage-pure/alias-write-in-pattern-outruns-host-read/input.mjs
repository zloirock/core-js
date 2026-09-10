// a destructuring host evaluates its whole right-hand side before any slot of its pattern, so a
// read in that right-hand side runs before an alias write a slot default holds - native throws.
// the write's span again ends before the read textually, so the offset gate admitted a narrow
// that erased it: the host read keeps the runtime ctor guard, a read after the host still narrows
let P;
const [q = (({ Promise: P } = globalThis), 1)] = [P.try(() => 1)];
export const after = P.try(() => 2);
export const r = q;
