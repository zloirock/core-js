import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A nested name read keeps the iterator function name available.
const _ref = [4, 5];
const iterName = _nameMaybeFunction(_getIteratorMethod(_ref));
const {
  second
} = _ref;
export const viaLiteralNoDefault = [iterName, second];