import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _at from "@core-js/pure/actual/instance/at";
// String literal `'.at('` happens to spell a method dispatch - the rewrite is bounded
// by AST nodes, so string content is never touched
const a = _at(arr).call(arr, -1);
const message = "calling .at(0) on the array";
const b = _findLastMaybeArray(arr2).call(arr2, p);