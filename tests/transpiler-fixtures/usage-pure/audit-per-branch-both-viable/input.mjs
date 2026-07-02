// both branches resolve to known globals with viable static polyfills for the destructured
// key. Each branch becomes its own `{key: _Branch$key}` literal, preserving runtime
// conditional semantics: `cond=truthy` -> Array.from polyfill, `cond=falsy` -> Iterator.from
// polyfill. Inline-default emission would alias one polyfill across both branches; per-
// branch synth keeps each runtime path on its matching constructor's polyfill
function f({ from } = cond ? Array : Iterator) { return from; }
const { from: g1 } = cond ? Array : Iterator;
let g2;
({ from: g2 } = cond ? Array : Iterator);
export { f, g1, g2 };
