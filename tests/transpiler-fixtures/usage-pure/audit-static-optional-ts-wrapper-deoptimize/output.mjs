import _Array$from from "@core-js/pure/actual/array/from";
// post-replace deoptimize walk peels through transparent wrappers
// (TS expression wrappers / ParenthesizedExpression / ChainExpression) when stripping
// the dangling-optional-on-now-non-optional parent. previously only the immediate
// parent was checked; a TS wrapper between the replaced static and the surviving
// `?.` would hide the dangling optional from the de-optimization pass. here:
// `(Array.from as any)?.([1])` - `?.([1])` is the optional call directly on a
// TSAsExpression-wrapped static. after `Array.from` -> `_Array$from` rewrite the
// `?.` becomes pointless (polyfill id never null); the walk now peels the
// TSAsExpression and de-optimizes the parent CallExpression
_Array$from([1]);