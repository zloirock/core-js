import _Array$from from "@core-js/pure/actual/array/from";
// `function fn({from} = window.Array)` - default uses bare-receiver MemberExpression as
// the proxy global. inline default `from = _Array$from` injected into ObjectPattern so
// the polyfill fires when caller omits the arg, but yields to user-supplied `{from: ...}`
// when present (default not evaluated). symmetric babel + unplugin
function fn({
  from = _Array$from
} = window.Array) {
  return from([1, 2]);
}
fn({}, undefined);
fn({
  from: () => 0
});