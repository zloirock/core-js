// IIFE assignment wrapped in `&&` / `||` short-circuits - the assignment may not run.
// `x` at the call site below MUST retain the original array type, not narrow to the
// string the IIFE would write. a LogicalExpression between the call and its enclosing
// ExpressionStatement must block the lift; otherwise only string.at emits, missing array.at
// for the runtime case where the LHS short-circuits and x stays [].
let x = [];
false && (() => { x = 'hello'; })();
x.at(-1);
