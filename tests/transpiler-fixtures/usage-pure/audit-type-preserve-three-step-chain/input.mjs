// type preservation across 3 intermediate bindings: each step returns Array. the final
// `.at(-1)` dispatches the array-narrowed polyfill, not the generic helper
const a = Array.from([1]);
const b = a.concat([2]);
const c = b.slice(0);
c.at(-1);
