import _at from "@core-js/pure/actual/instance/at";
// Direct eval stays in the source scope after the single keyed read.
export function read(factory, key) {
  var _ref3;
  const local = 11;
  const _ref = factory(),
    _ref2 = _ref,
    method = null == _ref2 ? _ref2[""] : (key(), (_ref3 = _at(_ref2)) === void 0 ? eval('local') : _ref3),
    {
      after
    } = _ref;
  return [method, after, local];
}