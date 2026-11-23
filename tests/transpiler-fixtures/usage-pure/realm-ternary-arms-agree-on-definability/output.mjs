import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$race from "@core-js/pure/actual/promise/race";
var _ref, _ref2, _ref3;
// Realm selections keep environment-dependent probes and user fallbacks.
// An absent probe throws where the source throws; a present arm supplies its pure static.
const flagged = _globalThis.flagged;
const {
  Array: {
    of: viaProbeArm
  }
} = flagged ? null == (_ref = _globalThis.window) ? _ref : {
  Array: {
    of: _Array$of
  }
} : {
  Array: {
    of: _Array$of
  }
};
const {
  Map: {
    groupBy: viaBothProbes
  }
} = flagged ? null == (_ref2 = _globalThis.window) ? _ref2 : {
  Map: {
    groupBy: _Map$groupBy
  }
} : null == (_ref3 = _globalThis.window) ? _ref3 : {
  Map: {
    groupBy: _Map$groupBy
  }
};
const {
  Promise: {
    race: viaBothGuaranteed
  }
} = {
  Promise: {
    race: _Promise$race
  }
};
const {
  Iterator: {
    from: viaLogical
  }
} = {
  Iterator: {
    from: _Iterator$from
  }
};
export { viaProbeArm, viaBothProbes, viaBothGuaranteed, viaLogical };