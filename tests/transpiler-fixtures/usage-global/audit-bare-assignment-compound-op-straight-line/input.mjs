// bare assignment as RHS of a non-logical compound AssignmentExpression (`+=`,
// arithmetic) - both sides unconditionally evaluated, so the inner write IS straight-line.
// unlike the short-circuiting trio `||=` / `&&=` / `??=` (which would bail), arithmetic
// compounds let the narrow proceed: only the receiver-specific es.string.at is emitted
let x = [];
let y = 0;
y += (x = 'hello', 5);
x.at(-1);
