import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
// the pair lands by the slot its host stands in: an unbraced control body gets BRACED around it, a
// LOOP HEAD takes it as declarators (they evaluate in order, so the minted name is bound first), a
// CATCH param relocates into the body and extracts there, a flatten sibling splits the declaration
// around it, and an exported host binding nothing else drops its wrapper onto the extraction
const rows = [[1, [2]], [3]];
const bodyless = function () {
  if (rows.length) {
    var [_ref] = rows;
    var at = _atMaybeArray(_ref);
  }
  return at;
}();
const loopInit = function () {
  for (var [_ref2] = rows, at = _atMaybeArray(_ref2), i = 0; i < 1; i++);
  return at;
}();
const caught = function () {
  try {
    throw rows;
  } catch (_ref3) {
    let [_ref4] = _ref3;
    let at = _at(_ref4);
    return at;
  }
}();
const besideFlatten = function () {
  var xf = _Array$from;
  var [_ref5] = rows;
  var at = _atMaybeArray(_ref5);
  return [typeof xf, at];
}();
const [_ref6] = rows;
export const exportedSole = _atMaybeArray(_ref6);
export { bodyless, loopInit, caught, besideFlatten };