// `new function () { ... }()` is a synchronous IIFE shape: the function body
// runs once with the resulting object discarded, and any bare-write inside it
// to an outer-var var-scope binding is still straight-line-reachable from
// post-call usage. findEnclosingIIFE must accept NewExpression symmetrically
// with CallExpression / OptionalCallExpression to surface the typed write
var x;
new function () { x = "hi"; }();
var first = x.at(0);
var contains = x.includes("h");
export { first, contains };
