import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// 3-level nested SE wrapping the destructure AE. each SE level contributes one prefix
// expression to the cascade emit. source order must be preserved: tagA -> tagB -> tagC
// then the polyfill assignment. inner-to-outer walker now unshifts each level's prefix
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