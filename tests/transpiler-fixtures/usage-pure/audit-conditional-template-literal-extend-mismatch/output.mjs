import _at from "@core-js/pure/actual/instance/at";
// `T extends `x${string}` ? Promise<string> : number[]` - template-pattern decidability is
// beyond the resolver. the babel-parser template-extend shape `TSLiteralType { literal:
// TemplateLiteral }` (vs oxc's TSTemplateLiteralType) must not be mistaken for a plain string
// primitive, else the conditional always picks Promise and `.at(0)` emits no polyfill; with
// both shapes recognised it bails to undecidable, visits both branches, and a generic `_at` emits
type Wrap<T> = T extends `x${string}` ? Promise<string> : number[];
declare const r: Wrap<'mismatch'>;
_at(r).call(r, 0);