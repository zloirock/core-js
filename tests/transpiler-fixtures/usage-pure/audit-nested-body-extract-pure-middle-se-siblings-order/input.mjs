// The body-extracted polyfill binding (`at`) sits in the MIDDLE property, flanked by sibling receiver values
// that carry side effects (`a: [x()]` before, `c: [z()]` after). the middle value is a CONSTANT array literal,
// so the body-extract fires and memoizes it into a single `_ref` (re-emitting it would duplicate the whole
// literal beside the surviving residual). the residual keeps the real sibling bindings `a` / `c`, so it is
// NOT eliminated. order is preserved: `_ref` holds a side-effect-free constant (hoisting it can't reorder),
// and the residual still runs `x()` then `z()` in source order
function x() { return 1; }
function z() { return 3; }

const { a, b: { at }, c } = { a: [x()], b: [1, 2, 3], c: [z()] };
at();
export const out = [a, c];
