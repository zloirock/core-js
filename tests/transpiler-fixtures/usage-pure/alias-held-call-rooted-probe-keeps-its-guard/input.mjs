// an alias holds a value the VALUE canon calls absent-able through an inline CALL - a source the
// hop-based alias walk cannot see, since the held nav has no unbacked hop of its own. the read is
// visited BEFORE the declarator is rendered, so the alias arm is the only thing that can answer,
// and the `?.` over the store stays load-bearing: erased, the claim runs where the source
// short-circuits. observable as TEXT and at runtime, never as an import set
export function read() {
  return (q = w?.Array)?.from([1]);
}

let q;
function dw() {
  return globalThis.window;
}
const w = dw()?.self;

// NEGATIVE: a call yielding the always-defined root leaves nothing for the alias to hold absent
function dg() {
  return globalThis;
}
const g = dg()?.self;
export const defined = g?.Array.from([2]);

export { g, q, w };
