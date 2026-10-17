import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
// `((cond ? Array : Iterator) as any)` - TS expression wrapper around a fallback.
// Per-branch destructure rewriting must peel both parenthesized and TS as-cast
// wrappers to reach the selection underneath. Under a TS non-null assertion (!) a `||`
// whose left always yields folds inside it (`Array!`), and one whose left the build
// does not serve mirrors its right arm through it
export const {
  from
} = (cond ? {
  from: _Array$from
} : {
  from: _Iterator$from
}) as any;
export const {
  values
} = Array!;
export const {
  isInteger
} = (_globalThis.WeakRef || {
  isInteger: _Number$isInteger
})!;