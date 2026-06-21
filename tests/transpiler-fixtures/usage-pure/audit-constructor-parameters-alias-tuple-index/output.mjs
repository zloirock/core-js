import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a type alias of `ConstructorParameters<typeof Cls>` followed by a numeric index. the alias
// chain must be walked before the ConstructorParameters check, else the indexed tuple element
// is looked up against the alias name `CtorParams` (not `ConstructorParameters`) and falls
// through to generic dispatch. parallel to the `Parameters<>` alias-tuple-index case
class Widget {
  constructor(items: number[], label: string) {}
}
type CtorParams = ConstructorParameters<typeof Widget>;
declare const xs: CtorParams[0];
_atMaybeArray(xs).call(xs, 0);