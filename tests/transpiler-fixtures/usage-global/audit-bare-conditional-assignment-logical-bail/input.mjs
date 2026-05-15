// bare assignment (no IIFE wrap) sitting inside a LogicalExpression - the assignment
// runs only when the LogicalExpression's LHS short-circuits to evaluate its RHS. the
// chain walker rejects the assignment as straight-line: from `x = ...` up to the
// enclosing ExpressionStatement passes through LogicalExpression which is NOT in the
// always-evaluating wrappers whitelist. without the bail the resolver would narrow
// `x` to the string the bare assignment writes, missing array.at for the short-circuit
// case where `x` retains its initial array value
let x = [];
false && (x = 'hello');
x.at(-1);
