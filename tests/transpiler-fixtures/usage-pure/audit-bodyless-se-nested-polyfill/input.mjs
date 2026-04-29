// bodyless `if` (single-statement form) with a SequenceExpression-wrapped init
// containing a polyfillable call. the lifted SE prefix goes into a block, and the cloned
// subtree's `Array.from(xs)` still gets visited and polyfilled on the second pass -
// no nested polyfill should be lost during the body-lift rewrite
if (cond) var { from } = (Array.from(xs), Array);
