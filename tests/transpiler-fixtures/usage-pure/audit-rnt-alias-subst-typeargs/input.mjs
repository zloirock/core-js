// higher-kinded shape: GenericMember<F, U> = { get(): F<U> }. when F substitutes
// to Box and U substitutes to string, applyAliasSubstDeep used to drop the
// typeArguments from F<U>, leaving substituted = Box (no args). outer Array
// narrowing still resolved (Box body is X[]) but the element-type binding was
// lost: chained .includes after .at(0) fell back to generic instance dispatch
// instead of resolving the element to string
type Box<X> = X[];
type GenericMember<F, U> = { get(): F<U> };
declare const v: GenericMember<Box, string>;
v.get().at(0).includes("a");
const second = v.get();
second.findLast(it => it != null);
