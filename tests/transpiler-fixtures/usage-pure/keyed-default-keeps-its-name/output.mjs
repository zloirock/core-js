import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
// The keyed read runs once before the default and the next property.
// An anonymous default retains the name of its source binding.
export function read(factory, key) {
  var _ref3;
  const _ref = factory(),
    _ref2 = _ref,
    method = null == _ref2 ? _ref2[""] : (key(), (_ref3 = _at(_ref2)) === void 0 ? {
      "method": function () {}
    }["method"] : _ref3),
    {
      after
    } = _ref;
  return [_nameMaybeFunction(method), after];
}