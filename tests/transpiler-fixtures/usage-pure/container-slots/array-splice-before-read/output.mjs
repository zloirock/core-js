import _spliceMaybeArray from "@core-js/pure/actual/array/instance/splice";
import _entries from "@core-js/pure/actual/instance/entries";
import _Map from "@core-js/pure/actual/map/constructor";
// Splice replaces the element read by the nested pattern with another constructor.
const repositionedBySplice = function () {
  const spliced = [Object];
  _spliceMaybeArray(spliced).call(spliced, 0, 1, _Map);
  const entries = _entries(spliced[0]);
  return entries;
}();
export { repositionedBySplice };