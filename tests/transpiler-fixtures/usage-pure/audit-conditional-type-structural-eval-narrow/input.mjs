// member access through a conditional type whose check / extends are non-literal
// (`T extends string ? {foo: string[]} : {foo: number[]}`). AST equality picker only
// handles literal-vs-literal pairs and bails on `string` vs `string` (TSStringKeyword,
// not TSLiteralType). findTypeMember must fall through to structural Type Object eval
// (`pickConditionalBranch` after resolving check + extends), pick the firing branch index,
// then recurse on the original AST trueType so member lookup keeps working with TSTypeLiteral
// (which `evaluateConditionalType`'s branch substitution would collapse to null)
type Wrap<T> = T extends string ? { foo: string[] } : { foo: number[] };
declare const w: Wrap<string>;
w.foo.at(0);
w.foo.includes('a');
