import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// A tagged template is a CALL of its tag: the strings array fills the first slot, the interpolations
// follow, and the value the tag hands back is read the way a call's value is - so a read off it
// takes its polyfill and the tag still evaluates ahead of that read. The receiver the swap erases
// re-emits as a sequence prefix, which is what keeps the tag's own evaluation where the source
// wrote it, and both legs spell it the same way.
const tag = () => _Map;
const a = (tag`x`, _Map).has(1);
const tag2 = () => _Set;
const b = (tag2`y`, _Set).intersection(new _Set([1]));
function pick(strings, value) {
  return value;
}
export const viaStatic = (pick`${_Map}`, _Map$groupBy)([1], x => x);
export { a, b };