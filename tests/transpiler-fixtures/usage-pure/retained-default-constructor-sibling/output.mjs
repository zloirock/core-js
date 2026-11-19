import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// Repeated native siblings split the default into ordered reads.
// The constructor beside the static claim still comes from its pure import.
function read(_ref = void 0) {
  let _ref2 = false;
  let _ref3 = _ref === void 0 ? (_ref2 = true, _globalThis) : _ref,
    {} = _ref3,
    {
      Array: _ref4
    } = _ref2 ? {
      "Array": _globalThis.Array
    } : _ref3,
    {} = _ref4,
    {
      from
    } = _ref2 ? {
      from: _Array$from
    } : _ref4,
    {
      Map: M
    } = _ref2 ? {
      Map: _Map
    } : _ref3,
    {
      missing: a
    } = _ref3,
    {
      missing: b
    } = _ref3;
  return [from([7])[0], typeof M, a, b];
}
read();