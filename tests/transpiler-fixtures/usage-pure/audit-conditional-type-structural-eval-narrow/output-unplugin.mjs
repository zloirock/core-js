import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// member access through a conditional type whose check / extends are non-literal
// (`T extends string ? {foo: string[]} : {foo: number[]}`). literal-vs-literal AST
// equality bails on `string` vs `string` (TSStringKeyword, not TSLiteralType), so
// branch selection must fall through to a structural eval, pick the firing branch,
// then recurse on the original AST trueType to keep TSTypeLiteral member lookup working
type Wrap<T> = T extends string ? { foo: string[] } : { foo: number[] };
declare const w: Wrap<string>;
_atMaybeArray(_ref = w.foo).call(_ref, 0);
_includesMaybeArray(_ref2 = w.foo).call(_ref2, 'a');