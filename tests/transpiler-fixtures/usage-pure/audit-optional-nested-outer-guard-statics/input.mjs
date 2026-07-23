// outer-guarded statics composing in one statement: a static whose ARGUMENT is itself an outer-guarded
// static (two independent guard memos nest), and two outer-guarded statics side by side in an array. each
// static emits BARE into its own owning guard's body; the memos do not collide. distinct method per line.
let w;
let v;
const g = globalThis;
export const nestedArg = (w = g)?.Array.of((v = globalThis.window)?.Array.from([1]).at(0)).at(0);
export const arrayOfTwo = [(w = g)?.Array.of(1).at(0), (v = globalThis.window)?.Array.from([2]).includes(2)];
