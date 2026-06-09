import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
const from = _Array$from;
// a side-effecting computed key sharing its VariableDeclaration with another declarator. the polyfill is
// extracted to a preceding `const`; the key stays in the residual declarator with its value renamed.
// effect runs once, polyfill ALWAYS wins. regression: the old inline default read the native instead
const first = 1,
  {
    [(effectful(), 'from')]: _unused
  } = Array;
const probe = _includesMaybeArray(_ref = [1, 2]).call(_ref, 2);