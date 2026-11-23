import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$race from "@core-js/pure/actual/promise/race";
const log = [];
const groupBy = _Map$groupBy;
const name = _nameMaybeFunction(_Map),
  {
    [(_pushMaybeArray(log) || 0).call(log, typeof groupBy)]: other
  } = _globalThis;
const target = {};
const source = (target.race = _Promise$race, _globalThis);
export { groupBy, name, other, source, target, log };