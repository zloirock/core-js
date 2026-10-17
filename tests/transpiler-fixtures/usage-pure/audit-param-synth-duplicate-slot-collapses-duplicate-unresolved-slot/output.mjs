import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Several pattern props may name ONE runtime slot.
const duplicateUnresolvedSlot = function ({
  'z': z1,
  'z': z2,
  from,
  of
} = {
  'z': Array['z'],
  from: _Array$from,
  of: _Array$of
}) {
  return [from, of, z1, z2];
}();
export { duplicateUnresolvedSlot };