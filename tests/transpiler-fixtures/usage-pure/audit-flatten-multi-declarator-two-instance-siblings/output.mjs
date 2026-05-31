import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// proxy-global flatten declarator sharing a VariableDeclaration with TWO instance-method
// destructuring siblings (`{ at } = getArr()`, `{ flat } = getArr2()`). the flatten owns the
// whole-declaration rewrite and renders each sibling's polyfill inline, so neither `at` nor
// `flat` is lost. distinct from the single-sibling case: exercises rewriting multiple sibling
// slots. regression lock
const at = _at(getArr());
const flat = _flatMaybeArray(getArr2());
const from = _Array$from;
at;
flat;
from([1]);