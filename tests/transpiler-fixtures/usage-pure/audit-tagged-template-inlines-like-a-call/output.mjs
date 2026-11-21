import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// The tag and its substitutions run before each static read on the returned constructor.
const effects = [];
const tag = () => {
  _pushMaybeArray(effects).call(effects, "first");
  return _Map;
};
const a = (tag`x`, _Map$groupBy)([1], x => x).get(1);
const tag2 = () => Array;
const b = (tag2`y`, _Array$from)([2]);
function pick(strings, value) {
  _pushMaybeArray(effects).call(effects, "pick");
  return value;
}
export const viaStatic = (pick`${_pushMaybeArray(effects).call(effects, "argument"), _Map}`, _Map$groupBy)([1], x => x);
export { a, b, effects };