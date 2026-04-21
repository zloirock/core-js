// const enum access — inlined at runtime by TS, but for us the declaration IS still
// TSEnumDeclaration (with `const: true`). resolveEnumType should work; `E.A.at(-1)`
// would call .at on the resolved primitive.
const enum E { A = 'hello', B = 'world' }
declare const e: E;
e.at(0);
