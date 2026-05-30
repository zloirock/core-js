// Parentheses around an optional call terminate the optional chain, so the trailing
// non-optional instance method runs on the call RESULT and must throw on a nullish
// result rather than short-circuit to undefined. The polyfilled inner call and the
// outer call must not fold into one short-circuiting chain.
const r = (arr.flat?.()).includes(3);
