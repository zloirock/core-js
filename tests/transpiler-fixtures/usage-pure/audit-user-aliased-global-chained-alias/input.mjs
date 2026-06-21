// chained user-aliased global: `const A = Array; const B = A; new B(...)`. exercises the
// multi-hop alias walk B -> A -> Array. each hop is a const-bound Identifier with no
// constantViolations, so the walk completes to the canonical unbound global name.
// NewExpression on B is treated as new Array, arr is an Array instance.
const A = Array;
const B = A;
const arr = new B(1, 2, 3);
arr.at(0);
