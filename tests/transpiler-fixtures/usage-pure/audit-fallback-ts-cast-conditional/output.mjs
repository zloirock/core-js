import _Set from "@core-js/pure/actual/set/constructor";
import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// `((cond ? Array : Iterator) as any)` - TS expression wrapper around a fallback.
// Per-branch destructure rewriting must peel both parenthesized and TS as-cast
// wrappers to reach the conditional underneath; the second statement covers the TS
// non-null assertion (!) variant
export const {
  from
} = (cond ? {
  from: _Array$from
} : {
  from: _Iterator$from
}) as any;
export const {
  values
} = (Array || _Set)!;