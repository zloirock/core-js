import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// const enum access — inlined at runtime by TS, but for us the declaration IS still
// TSEnumDeclaration (with `const: true`). resolveEnumType should work; `E.A.at(-1)`
// would call .at on the resolved primitive.
const enum E { A = 'hello', B = 'world' }
declare const e: E;
_atMaybeString(e).call(e, 0);