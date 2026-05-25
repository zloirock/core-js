import _Map from "@core-js/pure/actual/map/constructor";
// `Map! ||= 1` parses as AssignmentExpression{left: TSNonNullExpression{expression: Map}}.
// the Identifier visitor's direct parent is the TS wrapper, not the assignment; without
// peeling the wrappers between the identifier and the assignment, the warning misses.
// expected: same warning as bare `Map ||= 1` since the LHS resolves to the same global
_Map ||= 1;