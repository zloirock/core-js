import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Polyfilled optional-chain (`.at`) inside TS expression wrappers, with two outer-shape
// variants observing the unplugin `guardNeedsParens` chain-aware paren decision:
//   line a `(arr?.at(-1) as any).repeat(2)` - source paren terminates inner chain, outer
//     `.repeat` is regular member (no ChainExpression for outer). guardNeedsParens
//     compares ChainExpression ancestors via `sharesChainExpression`: meta's chain (the
//     inner one) vs outer's chain (null) differ -> WRAP the ternary so TS `as` binds
//     to whole `(cond ? a : b)`, matching babel codegen's auto-paren insertion
//   line b `arr?.at(-1)!.toString()` - no source paren, chain extends through `!` to
//     `.toString()` (same ChainExpression). sharesChainExpression returns true -> SKIP
//     wrap so `.toString()` stays inside the ternary's else-branch and short-circuit
//     semantics preserve (arr null -> void 0, no `.toString` call)
// also exercises babel-plugin's defensive `embedGuard + check=null` null-guard at
// `replaceAndWrap` (path becomes regular MemberExpression with TS-wrapped object).
// distinct outer methods (.repeat / .toString) per slot keep emission observable
declare const arr: number[];
const a = ((arr == null ? void 0 : _atMaybeArray(arr).call(arr, -1)) as any).repeat(2);
const b = arr == null ? void 0 : _atMaybeArray(arr).call(arr, -1)!.toString();
export { a, b };