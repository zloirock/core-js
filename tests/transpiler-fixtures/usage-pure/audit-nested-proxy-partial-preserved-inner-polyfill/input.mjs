// partial nested flatten: `from` is a plain binding, `of = Array.of` has a default whose
// inner expression is itself polyfillable. both legs must flatten into standalone bindings
// so that `Array.of` inside the AssignmentPattern default is also rewritten to its polyfill
const { Array: { from, of = Array.of } } = globalThis;
from([1, 2]);
of(3);
