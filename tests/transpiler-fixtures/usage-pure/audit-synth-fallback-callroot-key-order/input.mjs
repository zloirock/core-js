// A retained effectful realm receiver keeps logical-default reads and source order.
// The ordinary static fallback control retains its synthesis.
function f({ from } = (() => (n++, globalThis))()[(eff(), 'self')].Array || Set) { return from; }
function g({ of } = (eff2(), Array) || Set) { return of; }
export const r = [f(), g()];
