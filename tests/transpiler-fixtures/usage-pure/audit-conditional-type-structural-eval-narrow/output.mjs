import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// member access through a conditional type whose check / extends are non-literal
// (`T extends string ? {foo: string[]} : {foo: number[]}`). AST equality picker only
// handles literal-vs-literal pairs and bails on `string` vs `string` (TSStringKeyword,
// not TSLiteralType). findTypeMember must fall through to structural Type Object eval
// (`pickConditionalBranch` after resolving check + extends), pick the firing branch index,
// then recurse on the original AST trueType so member lookup keeps working with TSTypeLiteral
// (which `evaluateConditionalType`'s branch substitution would collapse to null)
type Wrap<T> = T extends string ? {
  foo: string[];
} : {
  foo: number[];
};
declare const w: Wrap<string>;
_atMaybeArray(_ref = w.foo).call(_ref, 0);
_includesMaybeArray(_ref2 = w.foo).call(_ref2, 'a');