import _spliceMaybeArray from "@core-js/pure/actual/array/instance/splice";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// Keep a generic dispatcher after extracting a mutator.
const extracted = [[1], [2]];
const m = _spliceMaybeArray(extracted);
export const viaMutatorExtraction = _includes(_ref = extracted[0]).call(_ref, 5);