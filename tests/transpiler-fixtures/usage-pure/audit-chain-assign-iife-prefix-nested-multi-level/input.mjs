// nested chain-assign with IIFE-prefix-SE: `(a = b = IIFE())` where peeling alternates
// paren + chain-assign down to the rhs IIFE. The outer emitter preserves the WHOLE
// `a = b = IIFE()` expression as a SequenceExpression prefix; the inner IIFE evaluates
// exactly once because `chainAssignOuter` is non-null and member-resolution does not
// double-push the inner root-call onto sideEffects.
let a; let b;
let calls = 0;
const r = (a = b = (() => { calls++; return Promise; })()).resolve(1);
[r, a, b, calls];
