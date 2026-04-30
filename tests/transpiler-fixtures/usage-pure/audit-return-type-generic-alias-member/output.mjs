import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `ReturnType<Fn<X>>.x` where `Fn<T>` is a generic function-type alias. routes through
// the alias-chain branch in `getTypeMembers` ReturnType case, with the type-arg `X`
// substituted into the resolved return type via `applyAliasSubstDeep`. without the
// generic-alias path, the inner member access falls to generic dispatch
type Fn<T> = () => T[];
declare const xs: ReturnType<Fn<string>>;
_atMaybeArray(xs).call(xs, 0);