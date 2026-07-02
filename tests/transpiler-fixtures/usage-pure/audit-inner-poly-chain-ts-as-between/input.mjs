// findInnerPolyChain walks past TS expression wrappers / ChainExpression / Parenthesized
// between outer member and the inner optional call. Tests `as` cast between the inner
// `?.()` and the outer `.method()`. replaceInstanceChainCombined fires on outer member.
declare const arr: number[] | null;
const result = (arr?.at?.(0) as number)?.toString();
