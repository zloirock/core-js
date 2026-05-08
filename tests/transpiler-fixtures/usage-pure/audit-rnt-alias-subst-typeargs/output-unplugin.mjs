import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// higher-kinded shape: GenericMember<F, U> = { get(): F<U> }. nested type-arg
// substitution preserves typeArguments through alias resolution: when F = Box and
// U = string, Box<X> = X[] resolves with X = string. element-type binding propagates
// through the layered aliases so chained .includes after .at(0) dispatches to the
// string-specific polyfill instead of the generic instance one
type Box<X> = X[];
type GenericMember<F, U> = { get(): F<U> };
declare const v: GenericMember<Box, string>;
_includesMaybeString(_ref = _atMaybeArray(_ref2 = v.get()).call(_ref2, 0)).call(_ref, "a");
const second = v.get();
_findLastMaybeArray(second).call(second, it => it != null);