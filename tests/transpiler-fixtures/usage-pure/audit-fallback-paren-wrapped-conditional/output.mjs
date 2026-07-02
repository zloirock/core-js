import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// `(cond ? Array : Iterator)` - paren-wrapped fallback receiver. Per-branch destructure
// rewriting peels the outer paren wrapper to reach the conditional, so each branch's
// identifier reaches the receiver classifier and both sides emit their polyfill
export const {
  from
} = cond ? {
  from: _Array$from
} : {
  from: _Iterator$from
};