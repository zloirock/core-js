import _Array$from from "@core-js/pure/actual/array/from";
// `function({ from } = X)` - object destructure with a default at param position. a
// per-key default `{from = _P} = X` can't protect against a buggy native `X.from` (it
// only fires on undefined), so the receiver is swapped: every key becomes an explicit
// entry in a synthetic object, binding `f()` to the polyfill. caller args bypass the default
function f({
  from
} = {
  from: _Array$from
}) {
  return from;
}
f;