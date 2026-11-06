import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// A partial mirror keeps the selected receiver and the disabled property on a second pass.
export function read(_ref = {
  box: null ?? source()
}) {
  let {
      box: _ref2
    } = _ref,
    {
      marker = -1
    } = _ref2,
    at = _at(_ref2);
  return [marker, at];
}
export function statics({
  Array: {
    from,
    // core-js-disable-next-line
    of
  }
} = {
  Array: {
    from: _Array$from,
    // core-js-disable-next-line
    of: _globalThis.Array.of
  }
}) {
  return [from, of];
}