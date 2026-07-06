import _Array$from from "@core-js/pure/actual/array/from";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _at from "@core-js/pure/actual/instance/at";
// Two instance methods extracted off ONE non-global receiver in a flatten-declaration sibling: the
// receiver is memoized once, at the sibling's source slot (after the flatten extraction) on both
// emitters - single-eval, source order kept, no sidecar
const from = _Array$from;
const _ref = getArr();
const at = _at(_ref);
const concat = _concatMaybeArray(_ref);
from([1]);
console.log(at, concat);