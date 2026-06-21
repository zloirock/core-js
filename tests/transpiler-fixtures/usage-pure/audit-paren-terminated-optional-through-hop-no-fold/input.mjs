// Parentheses around an optional call terminate the chain even with an intermediate
// non-optional hop between the parens and the outer call. The chain ends at the inner `)`,
// so `.map(...)` runs on the call RESULT and the trailing `.includes` must throw on a nullish
// result rather than fold into a short-circuit that swallows the throw into undefined. The
// inner optional call, the hop, and the outer call each emit as separate `.call(this)` steps.
const r = (arr.flat?.()).map(x => x).includes(3);
