// higher-kinded shape: GenericMember<F, U> = { get(): F<U> }. nested type-arg
// substitution preserves typeArguments through alias resolution: when F = Box and
// U = string, Box<X> = X[] resolves with X = string. element-type binding propagates
// through the layered aliases so chained .includes after .at(0) dispatches to the
// string-specific polyfill instead of the generic instance one
type Box<X> = X[];
type GenericMember<F, U> = { get(): F<U> };
declare const v: GenericMember<Box, string>;
v.get().at(0).includes("a");
const second = v.get();
second.findLast(it => it != null);
