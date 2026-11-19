import _unshiftMaybeArray from "@core-js/pure/actual/array/instance/unshift";
import _Map from "@core-js/pure/actual/map/constructor";
// Unshift changes which constructor occupies the index read by the nested pattern.
const repositionedByUnshift = function () {
  const shifted = [Object];
  _unshiftMaybeArray(shifted).call(shifted, _Map);
  const {
    0: {
      groupBy
    }
  } = shifted;
  return groupBy;
}();
export { repositionedByUnshift };