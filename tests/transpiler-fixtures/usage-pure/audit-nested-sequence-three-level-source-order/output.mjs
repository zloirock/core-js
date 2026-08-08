import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// 3-level nested SE wrapping AE destructure. asserts each level's prefix
// evaluates in source order (log = ['A', 'B', 'C']), then polyfill assignment
const log = [];
function tagA() {
  _pushMaybeArray(log).call(log, 'A');
  return 0;
}
function tagB() {
  _pushMaybeArray(log).call(log, 'B');
  return 0;
}
function tagC() {
  _pushMaybeArray(log).call(log, 'C');
  return 0;
}
let from;
tagA();
tagB();
tagC();
from = _Array$from;
[log, from];