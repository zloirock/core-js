// partial nested flatten: `from` is a plain binding, `of = Array.of` has an inner expression
// that is itself polyfillable. previously `walkAstNodes` marked every descendant as skipped,
// so the preserved `{ of = Array.of }` kept `Array.of` unpolyfilled - buggy native would be
// used at runtime. flatten the AssignmentPattern leg too: both become standalone bindings
const { Array: { from, of = Array.of } } = globalThis;
from([1, 2]);
of(3);
