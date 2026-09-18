import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$race from "@core-js/pure/actual/promise/race";
// A ternary selecting the realm is decided by its TEST, so naming the same proxy is not enough to
// collapse it away. An arm the environment may not have still takes the literal, through a null test
// on the probe's own read: absent, the arm yields the probe and the read through it throws where
// native throws; present, the polyfill wins - and a host that spells the probe is the only one that
// ever runs that arm. Arms of the same KIND collapse whole - both probes carry the probe verdict on
// the operand yielded, both guaranteed collapse outright - and a logical fallback collapses on its
// VALUE, its nullish path rescued by the right operand.
const flagged = _globalThis.flagged;
const {
  Array: {
    of: viaProbeArm
  }
} = flagged ? null == _globalThis.window ? _globalThis.window : {
  Array: {
    of: _Array$of
  }
} : {
  Array: {
    of: _Array$of
  }
};
const viaBothProbes = ((null == _globalThis.window ? void 0 : _globalThis.window).Map, _Map$groupBy);
const viaBothGuaranteed = _Promise$race;
const viaLogical = _Iterator$from;
export { viaProbeArm, viaBothProbes, viaBothGuaranteed, viaLogical };