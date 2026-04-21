import _Array$from from "@core-js/pure/actual/array/from";
// SequenceExpression in init - markInitGlobals walks .expressions.
// The trailing identifier `Array` should be marked and resolved.
// Note: (0, Array) is a canonical "strip this binding" pattern in CJS output.
const from = _Array$from;