import _Array$of from "@core-js/pure/actual/array/of";
// direct `Array.from = X` mutation: a pre-pass detects the AssignmentExpression with a
// MemberExpression left and marks `Array.from` mutated, so later reads skip polyfill
// emission and the user's reassignment reaches the call site. independent `Array.of` still
// polyfills - the mutated-set is scoped per (object, key) pair, not per object.
Array.from = () => [];
Array.from([1, 2, 3]);
_Array$of(4, 5, 6);