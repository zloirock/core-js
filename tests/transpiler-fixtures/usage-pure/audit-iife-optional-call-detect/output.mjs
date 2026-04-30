import _Array$from from "@core-js/pure/actual/array/from";
// findIifeCallSite accepts OptionalCallExpression: babel emits distinct node, oxc wraps in
// ChainExpression. arrow optional-call (`(arrow)?.(arg)`) - if detected as IIFE, param
// destructure synth-swap fires
const r = (({
  from
}) => from)?.({
  from: _Array$from
});
r;