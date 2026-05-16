// chained user-aliased global: `const A = Array; const B = A; new B(...)`. exercises
// `resolveRuntimeExpression`'s multi-hop walk -- B -> A -> Array. each hop is const-bound
// Identifier without `constantViolations`, so the walk completes to the canonical unbound
// global name. NewExpression on B treated as new Array, arr is Array instance.
const A = Array;
const B = A;
const arr = new B(1, 2, 3);
arr.at(0);
