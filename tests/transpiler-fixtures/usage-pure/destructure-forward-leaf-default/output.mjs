import _values from "@core-js/pure/actual/instance/values";
// The method read precedes its live forward default and the following binding.
// The default cannot replace a missing native instance polyfill on a supplied array.
export function read(factory, key) {
  var _ref2;
  const _ref = factory(),
    value = null == _ref ? _ref[""] : (key(), (_ref2 = _values(_ref)) === void 0 ? after : _ref2),
    {
      after
    } = _ref;
  return [value, after];
}