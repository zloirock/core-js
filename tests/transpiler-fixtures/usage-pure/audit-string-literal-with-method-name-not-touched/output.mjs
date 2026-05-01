import _at from "@core-js/pure/actual/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// String literal `'.at('` happens to match what looks like an inner needle - text
// rewrite is bounded by AST ranges so the compose layer never touches the literal
const a = _at(arr).call(arr, -1);
const message = "calling .at(0) on the array";
const b = _findLastMaybeArray(arr2).call(arr2, p);