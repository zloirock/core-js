import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _Map from "@core-js/pure/actual/map/constructor";
// Fill can replace the constructor in the array element read by the nested pattern.
const repositionedByFill = function () {
  const filled = [Object];
  _fillMaybeArray(filled).call(filled, _Map);
  const {
    0: {
      isFrozen
    }
  } = filled;
  return isFrozen;
}();
export { repositionedByFill };