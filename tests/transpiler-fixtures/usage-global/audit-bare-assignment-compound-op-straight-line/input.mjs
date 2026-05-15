// bare assignment as RHS of a non-logical compound AssignmentExpression (`+=`,
// arithmetic) - both sides unconditionally evaluated, so the inner write IS
// straight-line. distinguishes the always-evaluating AssignmentExpression operators
// from the short-circuiting trio `||=` / `&&=` / `??=` (which would bail). chain
// walker accepts plain `=` and arithmetic-compound parents - narrow proceeds and
// only the receiver-specific polyfill (es.string.at) is emitted
let x = [];
let y = 0;
y += (x = 'hello', 5);
x.at(-1);
