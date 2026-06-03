// `Map! ||= 1` parses as AssignmentExpression{left: TSNonNullExpression{expression: Map}}.
// the TS-non-null wrapper sits between the identifier and the assignment. usage-pure peels it
// for two decisions: (1) the write-position check leaves `Map!` as the global - a frozen import
// binding cannot be the `||=` target, so substituting it would TypeError; (2) the logical-assign
// LHS warning still fires, same as bare `Map ||= 1`, since the LHS resolves to the same global
Map! ||= 1;
