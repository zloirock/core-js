import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// Positional captures keep native evaluation order across loop headers, control bodies, catches and exports.
// Sibling rewrites retain their own claims and internal temporaries.
const rows = [[1, [2]], [3]];
const bodyless = function () {
  if (rows.length) var [_ref] = rows,
    at = _at(_ref);
  return at;
}();
const loopInit = function () {
  for (var [_ref2] = rows, at = _at(_ref2), i = 0; i < 1; i++);
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
  var {
      Array: {
        from: xf
      }
    } = {
      Array: {
        from: _Array$from
      }
    },
    [_ref5] = rows;
  var at = _at(_ref5);
  return [typeof xf, at];
}();
const [_ref6] = rows;
export const exportedSole = _at(_ref6);
export { bodyless, loopInit, caught, besideFlatten };