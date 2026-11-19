// `Map! ||= 1` parses as AssignmentExpression{left: TSNonNullExpression{expression: Map}}.
// the TS-non-null wrapper sits between the identifier and the assignment; the slot recording
// peels it, so the wrapped form records and DEOPTS exactly like bare `Map ||= 1` - the
// statement stays verbatim, wrapper included
// @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
Map! ||= 1;
