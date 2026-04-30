import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// const-bound arrow callee: inlineCallReturnExpression follows the binding's init.
// Verifies receiver opacity through identifier-bound arrow IIFE.
const fn = () => [1, 2, 3];
_atMaybeArray(_ref = fn()).call(_ref, 0);