// IIFE assignment wrapped in `&&` / `||` short-circuits - the assignment may not run.
// `x` at the call site below MUST retain the original array type, not narrow to the
// string the IIFE would write. lift-through-IIFE walks the chain from the call to the
// enclosing ExpressionStatement and rejects when LogicalExpression sits in between.
// without the bail the resolver would emit only string.at, missing array.at for the
// possible runtime case where the LogicalExpression's LHS short-circuits and x stays []
let x = [];
false && (() => { x = 'hello'; })();
x.at(-1);
