import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set/constructor";
// Nested spread expansion keeps holes, effects and the following constructor in order.
export const log = [];
export const [first, second, {
  groupBy
}, ...rest] = [...[...[, (_pushMaybeArray(log).call(log, 1), 2)]], _Map, _Set];