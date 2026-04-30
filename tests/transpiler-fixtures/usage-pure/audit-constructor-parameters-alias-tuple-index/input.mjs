// alias of `ConstructorParameters<typeof Cls>` followed by numeric index. parallel to
// `Parameters<>` alias-tuple-index but routes through the constructor-method lookup in
// `resolveParametersParams`. without the alias-chain walk before the Parameters check,
// `findTupleElement` checks typeRefName on the alias `CtorParams` (not `ConstructorParameters`)
// and falls through to generic dispatch
class Widget {
  constructor(items: number[], label: string) {}
}
type CtorParams = ConstructorParameters<typeof Widget>;
declare const xs: CtorParams[0];
xs.at(0);
