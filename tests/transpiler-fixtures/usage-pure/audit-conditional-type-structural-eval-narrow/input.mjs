// member access through a conditional type whose check / extends are non-literal
// (`T extends string ? {foo: string[]} : {foo: number[]}`). literal-vs-literal AST
// equality bails on `string` vs `string` (TSStringKeyword, not TSLiteralType), so
// branch selection must fall through to a structural eval, pick the firing branch,
// then recurse on the original AST trueType to keep TSTypeLiteral member lookup working
type Wrap<T> = T extends string ? { foo: string[] } : { foo: number[] };
declare const w: Wrap<string>;
w.foo.at(0);
w.foo.includes('a');
