// `function fn({from} = window.Array)` - default uses a bare-receiver member access as
// the proxy global. Receiver-rewrite replaces the entire default with `{from: _Array$from}`
// so caller-omitted invocation always picks the polyfill, while caller-passed args bypass
// the default entirely. Trade-off: the side effect of evaluating `window.Array` chain is
// skipped when the caller omits the arg
function fn({ from } = window.Array) {
  return from([1, 2]);
}
fn({}, undefined);
fn({ from: () => 0 });
