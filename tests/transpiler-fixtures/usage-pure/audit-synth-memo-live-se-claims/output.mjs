import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// Retained realm keys and parameter defaults keep independent nested claims live.
// No outer receiver collapse may hide those source subtrees from traversal.
let tick = 0;
function keyClaim({
  groupBy: gb,
  more
} = (() => {
  var _ref;
  return _globalThis[_at(_ref = getObj()).call(_ref, 0), "self"].Map;
})()) {
  return [gb, more];
}
keyClaim();
function refOrder({
  groupBy: gb2,
  more2
} = _globalThis[tick++, "self"].Map, z = (() => {
  var _ref2;
  return _at(_ref2 = getObj()).call(_ref2, 0);
})()) {
  return [gb2, more2, z];
}
refOrder();
const log = [];
function proxyBranch({
  from: x,
  nope: y
} = (() => {
  var _ref3;
  return _globalThis[(_pushMaybeArray(log) || 0).call(log, _atMaybeArray(_ref3 = [3]).call(_ref3, 0)), "self"].Array;
})()) {
  return [typeof x, typeof y, log[0]];
}
use(proxyBranch());