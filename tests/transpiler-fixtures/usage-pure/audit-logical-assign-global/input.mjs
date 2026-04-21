// `Map ||= X` - LHS reads unbound Map which is a polyfillable global. substitution with
// read-only import binding throws. checkLogicalAssignLhsGlobal should warn and skip polyfill
Map ||= {};
Map &&= {};
Map ??= {};
