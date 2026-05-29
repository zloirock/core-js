import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// `const fromMethod = a = Array.from` - a chained assignment evaluates to its right operand,
// so fromMethod is Array.from. The assignment must be seen through to that binding: Array.from
// is polyfilled and its array return type drives the `.includes(1)` narrow on the result.
let a: unknown;
const fromMethod = a = _Array$from;
_includesMaybeArray(_ref = fromMethod([1, 2, 3])).call(_ref, 1);