// `indexFromArgLiteral` Numeric branch: same `NamedType[K]` shape but the call arg is
// a NumericLiteral and Items keys are numeric. without the Numeric branch the rewrite
// would skip the indexNode and the chain would fall back to plain resolveTypeAnnotation,
// dropping the narrow. with the branch a synthetic TSLiteralType{NumericLiteral} flows
// through the standard dispatcher's member-by-key lookup
type Items = { 0: string[]; 1: number[] };
declare function pick<K extends keyof Items>(k: K): Items[K];
pick(0).at(0);
