// destructuring assignment whose init is a logical expression: the LHS pattern still
// tracks the receiver correctly across the logical short-circuit.
let from;
({ from } = Array || Promise);
