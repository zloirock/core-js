import _Array$from from "@core-js/pure/actual/array/from";
// `function fn({from} = window.Array)` - default uses bare-receiver MemberExpression as
// the proxy global. synth-swap replaces the entire default with `{from: _Array$from}` so
// caller-omitted invocation always picks polyfill, while caller-passed args bypass the
// default entirely. trade-off: side effect of evaluating `window.Array` chain is skipped
// when caller omits arg
function fn({
  from
} = {
  from: _Array$from
}) {
  return from([1, 2]);
}
fn({}, undefined);
fn({
  from: () => 0
});