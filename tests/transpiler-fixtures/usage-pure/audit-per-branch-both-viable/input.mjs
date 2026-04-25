// both branches resolve to known globals with viable static polyfills for the destructured
// key. each branch becomes its own `{key: _Branch$key}` literal, preserving runtime
// conditional semantics: `cond=truthy` -> Array.from polyfill, `cond=falsy` -> Iterator.from
// polyfill. user gets the matching semantic per branch instead of one polyfill aliasing the
// other (which the inline-default pre-fix did)
function f({ from } = cond ? Array : Iterator) { return from; }
const { from: g1 } = cond ? Array : Iterator;
let g2;
({ from: g2 } = cond ? Array : Iterator);
export { f, g1, g2 };
