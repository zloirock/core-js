import _includes from "@core-js/pure/actual/instance/includes";
// `(arr?.includes)(1)` - parenthesized optional member followed by NON-optional call.
// native semantics:
//   - arr nullish: `(undefined)(1)` throws TypeError (chain ends at `?.`, outer `()` is
//     non-optional call on void 0)
//   - arr defined: calls `arr.includes(1)` with `this=arr` - Reference Type preserves
//     through parens per ECMA spec (verified empirically: `([1,2]?.at)(0) === 1`)
// polyfill emits `(arr == null ? void 0 : _includes(arr)).call(arr, 1)` to preserve BOTH
// semantics: nullish path throws via `.call` access on undefined; success path's `.call(arr, 1)`
// preserves `this=arr`. the parenLookupOnly branch in babel-plugin's `replaceInstanceLike` /
// unplugin's `replaceInstance` routes through this special form. args eval order shifts
// slightly on nullish (skipped where native evaluates) - acceptable for typical literal args
const v = (arr == null ? void 0 : _includes(arr)).call(arr, 1);