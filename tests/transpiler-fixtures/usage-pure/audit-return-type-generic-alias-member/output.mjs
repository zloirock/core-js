import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `ReturnType<Fn<X>>.x` where `Fn<T>` is a generic function-type alias. resolution
// follows the alias chain in the ReturnType case and substitutes the type-arg `X`
// deep into the resolved return type; without the generic-alias path the inner
// member access falls to generic dispatch.
type Fn<T> = () => T[];
declare const xs: ReturnType<Fn<string>>;
_atMaybeArray(xs).call(xs, 0);