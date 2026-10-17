import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
var _ref;
// a SHADOWING inner binding's mutator does not poison the outer binding - references are
// scope-discriminated
const shaded = [[1], [2]];
{
  const shaded = [9];
  _fillMaybeArray(shaded).call(shaded, 0);
}
export const viaShadowedMutator = _atMaybeArray(_ref = shaded[0]).call(_ref, 7);