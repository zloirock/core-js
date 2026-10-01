import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// numeric-literal call arg: same `NamedType[K]` shape but the arg is a NumericLiteral and
// Items keys are numeric. the numeric case must be handled, else the rewrite skips the index
// and the narrow drops. a synthetic TSLiteralType{NumericLiteral} then flows through the
// dispatcher's member-by-key lookup.
type Items = {
  0: string[];
  1: number[];
};
declare function pick<K extends keyof Items>(k: K): Items[K];
_atMaybeArray(_ref = pick(0)).call(_ref, 0);