// Parentheses around an optional call terminate the optional chain even when an
// intermediate non-optional hop sits between the parens and the outer call. The chain
// ends at the inner `)`, so `.map(...)` runs on the call RESULT and the trailing
// `.includes` must throw on a nullish result rather than fold into a short-circuiting
// chain that swallows the throw into undefined. The inner optional call, the intermediate
// hop, and the outer call must each emit as separate memoized `.call(this)` steps.
const r = (arr.flat?.()).map(x => x).includes(3);
