// `Map! ||= 1` parses as AssignmentExpression{left: TSNonNullExpression{expression: Map}}.
// the TS-non-null wrapper sits between the identifier and the assignment; the slot recording
// peels it, so the wrapped form records and DEOPTS exactly like bare `Map ||= 1` - the
// statement stays verbatim, wrapper included
Map! ||= 1;