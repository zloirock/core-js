import _Array$of from "@core-js/pure/actual/array/of";
// direct `Object.key = X` mutation. plugin's pre-pass `collectMutatedStaticMembers` detects
// AssignmentExpression{left: MemberExpression{Array.from}, operator: '='} and adds
// `"Array.from"` to the mutated-set. subsequent reads of `Array.from` skip polyfill emission
// + substitution so the user's reassignment reaches the call site. independent unaffected
// `Array.of` read still polyfills - the mutated-set is scoped per (object, key) pair, not
// per object
Array.from = () => [];
Array.from([1, 2, 3]);
_Array$of(4, 5, 6);