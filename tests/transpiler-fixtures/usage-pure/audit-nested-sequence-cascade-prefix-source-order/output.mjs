import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// Nested assignment sequences keep every prefix in source order.
// Both static bindings receive their polyfills after those prefixes.
const calls = [];
function fxA() {
  _pushMaybeArray(calls).call(calls, 'A');
  return 0;
}
function fxB() {
  _pushMaybeArray(calls).call(calls, 'B');
  return 0;
}
let from, of;
fxA();
fxB();
({
  Array: {
    from,
    of
  }
} = {
  Array: {
    from: _Array$from,
    of: _Array$of
  }
});
[calls, from, of];