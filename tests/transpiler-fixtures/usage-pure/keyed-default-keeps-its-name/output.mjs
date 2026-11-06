import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
// The keyed read runs once before the default and the next property.
// An anonymous default retains the name of its source binding.
export function read(factory, key) {
  var _ref2;
  const _ref = factory(),
    method = null == _ref ? _ref[""] : (key(), (_ref2 = _at(_ref)) === void 0 ? {
      "method": function () {}
    }["method"] : _ref2),
    {
      after
    } = _ref;
  return [_nameMaybeFunction(method), after];
}