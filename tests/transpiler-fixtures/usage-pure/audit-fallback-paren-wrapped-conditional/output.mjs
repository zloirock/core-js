import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// `(cond ? Array : Iterator)` - paren-wrapped fallback receiver. oxc preserves
// ParenthesizedExpression; without peeling, only one branch's identifier got polyfilled
// by the inner Identifier visitor (the other side stayed raw). per-branch synth-swap
// must reach the conditional underneath the paren wrapper
export const {
  from
} = cond ? {
  from: _Array$from
} : {
  from: _Iterator$from
};