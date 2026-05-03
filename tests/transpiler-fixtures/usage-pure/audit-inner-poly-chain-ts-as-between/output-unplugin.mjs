import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// findInnerPolyChain walks past TS_EXPR_WRAPPERS / ChainExpression / Parenthesized
// between outer member and the inner optional call. Tests `as` cast between the inner
// `?.()` and the outer `.method()`. replaceInstanceChainCombined fires on outer member.
declare const arr: number[] | null;
const result = (arr == null ? void 0 : _atMaybeArray(arr)?.call(arr, 0) as number)?.toString();