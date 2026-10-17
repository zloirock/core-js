import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// class without explicit constructor - `params` array is empty, so inner type inference
// cannot apply; fallback to generic `$Object('Array')` without inner
class Foo {}
declare const args: ConstructorParameters<typeof Foo>;
_atMaybeArray(args).call(args, 0);