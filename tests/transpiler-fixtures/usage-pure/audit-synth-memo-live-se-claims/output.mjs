import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
// a claim INSIDE the harvested se of a synth-swap memo argument lands during the walk, and
// the DRAIN re-harvests the live container: a registration-captured ref goes stale the
// moment the in-place claim REPLACES its node, and the frozen clone re-emitted the raw
// spelling (`getObj().at(0)` reached the memo arg unpolyfilled). the sibling locks the
// param-ref numbering around the same channel.
let tick = 0;
function keyClaim({
  groupBy: gb,
  more
} = (() => {
  var _ref;
  return _at(_ref = getObj()).call(_ref, 0), {
    groupBy: _Map$groupBy,
    more: _Map.more
  };
})()) {
  return [gb, more];
}
keyClaim();
function refOrder({
  groupBy: gb2,
  more2
} = (tick++, {
  groupBy: _Map$groupBy,
  more2: _Map.more2
}), z = (() => {
  var _ref2;
  return _at(_ref2 = getObj()).call(_ref2, 0);
})()) {
  return [gb2, more2, z];
}
refOrder();
// ... and the PROXY-plan branch of the same channel re-plans at drain too: the
// registration-time render of `(effects, root).Array` froze the raw effects while their
// landed rewrites died with the discarded original (imports pruned as unreferenced)
const log = [];
function proxyBranch({
  from: x,
  nope: y
} = (() => {
  var _ref4;
  return function (_ref3) {
    return {
      from: _Array$from,
      nope: _ref3.nope
    };
  }((_pushMaybeArray(log).call(log, _atMaybeArray(_ref4 = [3]).call(_ref4, 0)), _self).Array);
})()) {
  return [typeof x, typeof y, log[0]];
}
use(proxyBranch());