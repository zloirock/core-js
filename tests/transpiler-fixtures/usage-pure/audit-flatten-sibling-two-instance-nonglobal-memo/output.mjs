import _Array$from from "@core-js/pure/actual/array/from";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _at from "@core-js/pure/actual/instance/at";
const _ref = getArr();
// Two instance methods extracted off ONE non-global receiver in a flatten-declaration sibling: the
// receiver is memoized once. sidecar layout: unplugin keeps the memo at the sibling's source slot;
// babel hoists it above the flatten extraction (the general case reorders side effects across
// declarators) - benign here (the flatten init is pure), semantically identical, both single-eval
const from = _Array$from;
const at = _at(_ref);
const concat = _concatMaybeArray(_ref);
from([1]);
console.log(at, concat);