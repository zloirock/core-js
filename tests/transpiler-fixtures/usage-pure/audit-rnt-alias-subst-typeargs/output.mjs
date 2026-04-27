import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref, _ref2;
// higher-kinded shape: GenericMember<F, U> = { get(): F<U> }. when F substitutes
// to Box and U substitutes to string, applyAliasSubstDeep used to drop the
// typeArguments from F<U>, leaving substituted = Box (no args). outer Array
// narrowing still resolved (Box body is X[]) but the element-type binding was
// lost: chained .includes after .at(0) fell back to generic instance dispatch
// instead of resolving the element to string
type Box<X> = X[];
type GenericMember<F, U> = {
  get(): F<U>;
};
declare const v: GenericMember<Box, string>;
_includesMaybeString(_ref = _atMaybeArray(_ref2 = v.get()).call(_ref2, 0)).call(_ref, "a");
const second = v.get();
_findLastMaybeArray(second).call(second, it => it != null);