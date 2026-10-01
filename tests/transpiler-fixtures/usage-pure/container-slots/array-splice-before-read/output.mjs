import _spliceMaybeArray from "@core-js/pure/actual/array/instance/splice";
import _Map from "@core-js/pure/actual/map/constructor";
// Splice replaces the element read by the nested pattern with another constructor.
const repositionedBySplice = function () {
  const spliced = [Object];
  _spliceMaybeArray(spliced).call(spliced, 0, 1, _Map);
  const {
    0: {
      entries
    }
  } = spliced;
  return entries;
}();
export { repositionedBySplice };