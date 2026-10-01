// `(bar(), 'from') in (x = Array)` exercises BOTH sides of the SE rescue. the LHS
// SequenceExpression prefix `bar()` and the RHS `x = Array` (assignment side-effect AND
// binding update) must both execute. the receiver peels through the chain-assignment to
// bottom out on Array, and both rescues fold into one sequence prefix before constant `true`.
bar(), x = Array, true;