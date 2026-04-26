import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Set from "@core-js/pure/actual/set/constructor";
// `((cond ? Array : Iterator) as any)` - TS expression wrapper around a fallback.
// babel parser strips parens but keeps TSAsExpression; oxc keeps both. per-branch
// synth-swap must peel both wrapper layers to reach the conditional underneath
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