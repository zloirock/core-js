// `(bar(), 'from') in (x = Array)` exercises BOTH sides of the SE rescue:
// LHS - SequenceExpression prefix `bar()` must execute
// RHS - AssignmentExpression `x = Array` must execute (both the assignment side-effect
// AND the binding update). resolveObjectName peels chain-assignment to bottom out on
// Array, so meta.object resolves; then handleInExpression wraps both rescues into a
// single sequence prefix before the constant `true`.
(bar(), x = Array, true);
