import _at from "@core-js/pure/actual/instance/at";
// Direct eval stays in the source scope after the single keyed read.
export function read(factory, key) {
  var _ref2;
  const local = 11;
  const _ref = factory(),
    method = null == _ref ? _ref[""] : (key(), (_ref2 = _at(_ref)) === void 0 ? eval('local') : _ref2),
    {
      after
    } = _ref;
  return [method, after, local];
}