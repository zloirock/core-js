import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// multi-prop AE destructure under nested SE. guards two invariants jointly:
//   1. SE prefix side effects evaluate in source order (calls = ['A', 'B'])
//   2. both inner polyfillable props extract (no residual `({Array: {of}} = ...)`
//      from a sibling that the first prop's cascade orphaned)
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
from = _Array$from;
of = _Array$of;
[calls, from, of];