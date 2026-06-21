// Enum nested inside a namespace: `namespace N { enum E { A, B } }`. Member access
// `N.E[N.E.A]` is a numeric reverse mapping at runtime -> string. Enum resolution must
// collect the `[N, E]` MemberExpression segments and walk into the TSModuleDeclaration
// to find E, so `head` resolves to string and emits the string-specific includes import.
namespace N {
  export enum E { A, B }
}
const head = N.E[N.E.A];
head.includes('A');
