import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
// A literal default governs its branch while supplied values keep instance dispatch.
function read(_ref = [Object]) {
  let [_ref2] = _ref;
  let entries = _entriesMaybeArray(_ref2);
  return entries;
}
use(read([[1, 2]]));