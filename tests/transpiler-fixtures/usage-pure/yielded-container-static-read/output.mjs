import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A named callee that returns its parameter inside a container literal yields that container per
// call, so a static read through the slot lands on the argument and takes the pure static.
// The call keeps running ahead of the read wherever the callee is not provably effect-free.
const log = [];
function box(v) {
  return [v];
}
function wrap(s, v) {
  _pushMaybeArray(log).call(log, s);
  return {
    held: v
  };
}
const held = box(Array);
export const direct = _Array$of(1);
export const stored = _Array$from([1]);
export const inline = _Object$groupBy([1], x => x);
export const tagged = (wrap`${_Map}`, _Map$groupBy)([1], x => x);