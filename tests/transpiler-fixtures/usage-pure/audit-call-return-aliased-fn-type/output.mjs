import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// a call whose callee annotation is a function-type ALIAS: the alias must be followed (carrying any
// generic substitution) before the return type is read, so the receiver resolves to the concrete
// return - a direct alias and a generic one both surface their TSFunctionType (not a bare reference)
type Direct = () => number[];
type Generic<T> = () => T[];
declare const direct: Direct;
declare const generic: Generic<string>;
const a = _atMaybeArray(_ref = direct()).call(_ref, 0);
const b = _includesMaybeArray(_ref2 = generic()).call(_ref2, 'x');
export { a, b };